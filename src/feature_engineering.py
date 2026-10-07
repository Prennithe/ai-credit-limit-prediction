import pandas as pd


def customer_document_to_dataframe(customer):
    profile = customer["profile"]
    credit_history = customer["credit_history"]
    billing = customer["billing_history"]
    payment = customer["payment_history"]
    repayment = customer["repayment_history"]

    data = {
        "SEX": profile["sex"],
        "EDUCATION": profile["education"],
        "MARRIAGE": profile["marriage"],
        "AGE": profile["age"],

        "PAY_0": repayment["pay_0"],
        "PAY_2": repayment["pay_2"],
        "PAY_3": repayment["pay_3"],
        "PAY_4": repayment["pay_4"],
        "PAY_5": repayment["pay_5"],
        "PAY_6": repayment["pay_6"],

        "BILL_AMT1": billing["bill_amt_1"],
        "BILL_AMT2": billing["bill_amt_2"],
        "BILL_AMT3": billing["bill_amt_3"],
        "BILL_AMT4": billing["bill_amt_4"],
        "BILL_AMT5": billing["bill_amt_5"],
        "BILL_AMT6": billing["bill_amt_6"],

        "PAY_AMT1": payment["pay_amt_1"],
        "PAY_AMT2": payment["pay_amt_2"],
        "PAY_AMT3": payment["pay_amt_3"],
        "PAY_AMT4": payment["pay_amt_4"],
        "PAY_AMT5": payment["pay_amt_5"],
        "PAY_AMT6": payment["pay_amt_6"],
    }

    return pd.DataFrame([data])


def engineer_features(df):
    df = df.copy()

    df["EDUCATION"] = df["EDUCATION"].apply(
        lambda x: 4 if x not in [1, 2, 3] else x
    )

    df["MARRIAGE"] = df["MARRIAGE"].apply(
        lambda x: 3 if x not in [1, 2] else x
    )

    bill_cols = [f"BILL_AMT{i}" for i in range(1, 7)]
    pay_cols = [f"PAY_AMT{i}" for i in range(1, 7)]
    delay_cols = [
        "PAY_0",
        "PAY_2",
        "PAY_3",
        "PAY_4",
        "PAY_5",
        "PAY_6"
    ]

    # Same feature engineering used during training
    df["total_bill_amount"] = df[bill_cols].sum(axis=1)
    df["average_bill_amount"] = df[bill_cols].mean(axis=1)

    df["total_payment_amount"] = df[pay_cols].sum(axis=1)
    df["average_payment_amount"] = df[pay_cols].mean(axis=1)

    epsilon = 1e-5

    df["payment_to_bill_ratio"] = (
        df["total_payment_amount"]
        / (df["total_bill_amount"].replace(0, epsilon) + epsilon)
    )

    df["min_bill_amount"] = df[bill_cols].min(axis=1)
    df["max_bill_amount"] = df[bill_cols].max(axis=1)

    df["min_payment_amount"] = df[pay_cols].min(axis=1)
    df["max_payment_amount"] = df[pay_cols].max(axis=1)

    df["num_payment_delays"] = (
        df[delay_cols] > 0
    ).sum(axis=1)

    return df