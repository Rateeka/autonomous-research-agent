class VerificationAgent:

    def __init__(self):
        pass

    # -----------------------------
    # Main verification function
    # -----------------------------
    def verify(self, summaries):

        issues = []

        # Compare datasets
        datasets = [s.get("dataset") for s in summaries]

        if len(set(datasets)) > 1:
            issues.append(
                "⚠ Different datasets used across papers. Results may not be comparable."
            )

        # Compare models
        models = [s.get("model") for s in summaries]

        if len(set(models)) > 1:
            issues.append(
                "ℹ Multiple models detected. Comparison is heterogeneous."
            )

        # Check missing accuracy
        for i, s in enumerate(summaries):

            if s.get("accuracy") == "Not Found":
                issues.append(
                    f"⚠ Paper {i+1} missing accuracy value."
                )

        return {
            "is_reliable": len(issues) == 0,
            "issues": issues
        }


# -----------------------------
# TEST
# -----------------------------
if __name__ == "__main__":

    sample = [
        {
            "dataset": "Dataset A",
            "model": "CNN",
            "accuracy": "96%"
        },
        {
            "dataset": "Dataset B",
            "model": "Transformer",
            "accuracy": "92%"
        }
    ]

    agent = VerificationAgent()

    result = agent.verify(sample)

    print(result)