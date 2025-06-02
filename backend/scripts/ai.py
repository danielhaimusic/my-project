import ollama

# Ensure the model is downloaded and available
def ensure_model(model_name):
    try:
        ollama.show(model_name)
    except ollama.ResponseError:
        print(f"Model '{model_name}' not found. Downloading...")
        ollama.pull(model_name)

# Updated initial system prompt to set the model's behavior
initial_prompt = '''
אנא קרא את הטקסט הבא והפק ממנו את המידע בצורה מדויקת. הפלט חייב להיות בפורמט JSON תקין בלבד, ללא טקסט נוסף, ועקוב באופן מדויק אחרי הסכמה הבאה:

{
  "customer_name": "<string – שם הלקוח כפי שמופיע במסמך, למשל: אאבקום סנטרס בע"מ>",
  "order_number": "<string – מספר ההזמנה כפי שמופיע במסמך>",
  "products": [
    {
      "product_id": "<string – מק"ט המוצר>",
      "description": "<string – תאור המוצר כפי שמופיע במסמך>",
      "quantity": "<string – כמות המוצר>",
      "unit_price": "<string – מחיר ליחידה>",
      "total_price": "<string – מחיר סה\"כ>"
    },
    {...}
  ]
}

שים לב:
- אם נתון מסוים אינו מופיע במסמך, יש להחזיר מחרוזת ריקה עבור אותו שדה.
- הקפד להתמודד עם שונות בניסוח ובמיקום הנתונים במסמך.
'''

# Main function to run the model
def main():
    model_name = "mistral:7b-instruct"
    ensure_model(model_name)

    print("המודל מוכן לעבודה! הכנס את הטקסט לחילוץ הנתונים:")
    user_input = ""
    while True:
        line = input()
        if line.strip().lower() == "end":
            break
        user_input += line + "\n"

    response = ollama.chat(model=model_name, messages=[
        {'role': 'system', 'content': initial_prompt},
        {'role': 'user', 'content': user_input}
    ])

    print("\nתוצאת החילוץ בפורמט JSON:")
    print(response['message']['content'])

if __name__ == "__main__":
    main()