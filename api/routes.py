from flask import Blueprint, jsonify, request, Response
from flask_jwt_extended import jwt_required
import threading
import uuid
import queue
import json
from database.mongodb import MongoDB

api = Blueprint("api", __name__)

pipeline = None
db = MongoDB()

# In-memory stores for background task tracking
tasks = {}
task_queues = {}

def init_routes(run_pipeline):
    global pipeline
    pipeline = run_pipeline

def run_pipeline_async(task_id, query):
    def progress_callback(step, progress, message, status="running", data=None):
        payload = {
            "task_id": task_id,
            "step": step,
            "progress": progress,
            "message": message,
            "status": status,
            "data": data
        }
        
        # Update tasks state
        if task_id in tasks:
            tasks[task_id].update({
                "step": step,
                "progress": progress,
                "message": message,
                "status": status
            })
            if data:
                tasks[task_id]["data"] = data
        
        # Put into queue for SSE stream
        if task_id in task_queues:
            task_queues[task_id].put(payload)

    # Initialize task state
    tasks[task_id] = {
        "task_id": task_id,
        "query": query,
        "step": "started",
        "progress": 0,
        "message": "Initializing research pipeline...",
        "status": "running"
    }

    try:
        # Run the pipeline with progress callback
        result = pipeline(query, callback=progress_callback)
        progress_callback("completed", 100, "Research completed successfully!", status="completed", data=result)
    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"Error in pipeline task {task_id}: {error_msg}")
        traceback.print_exc()
        progress_callback("failed", 100, f"Error: {error_msg}", status="failed")

@api.route("/research", methods=["POST"])
@jwt_required()
def research():
    data = request.json
    query = data.get("query")
    if not query:
        return jsonify({"message": "Query required"}), 400
    
    # Maintain blocking compatibility
    result = pipeline(query)
    return jsonify(result)

@api.route("/research/async", methods=["POST"])
@jwt_required()
def research_async():
    data = request.json
    query = data.get("query")
    if not query:
        return jsonify({"message": "Query required"}), 400
    
    task_id = str(uuid.uuid4())
    
    # Setup queue for SSE stream
    task_queues[task_id] = queue.Queue()
    
    # Spawn pipeline execution thread
    thread = threading.Thread(target=run_pipeline_async, args=(task_id, query))
    thread.daemon = True
    thread.start()
    
    return jsonify({
        "task_id": task_id,
        "message": "Research task started in background"
    })

@api.route("/research/stream/<task_id>", methods=["GET"])
def stream_research(task_id):
    if task_id not in task_queues:
        return jsonify({"message": "Task queue not found or expired"}), 404
        
    def event_stream():
        q = task_queues.get(task_id)
        if not q:
            yield f"data: {json.dumps({'status': 'failed', 'message': 'Queue not found'})}\n\n"
            return
            
        yield f"data: {json.dumps({'status': 'started', 'message': 'Connecting to research progress stream...', 'progress': 5})}\n\n"
        
        while True:
            try:
                # Wait for next progress event from queue
                # 3-minute timeout to handle long-running pipeline chunks
                event = q.get(timeout=180)
                yield f"data: {json.dumps(event)}\n\n"
                
                if event["status"] in ["completed", "failed"]:
                    break
            except queue.Empty:
                yield f"data: {json.dumps({'status': 'failed', 'message': 'Task timed out due to inactivity'})}\n\n"
                break
        
        # Clean up queue when stream finishes
        if task_id in task_queues:
            del task_queues[task_id]
            
    return Response(event_stream(), mimetype="text/event-stream")

@api.route("/research/history", methods=["GET"])
@jwt_required()
def research_history():
    history = db.get_history()
    return jsonify(history)

@api.route("/reports/download/<path:filename>", methods=["GET"])
def download_report(filename):
    import os
    from flask import send_from_directory
    reports_dir = os.path.join(os.getcwd(), "reports")
    return send_from_directory(reports_dir, filename, as_attachment=True)

@api.route("/health")
def health():
    return jsonify({
        "status": "running"
    })