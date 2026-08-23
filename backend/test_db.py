import psycopg

try:
    connection = psycopg.connect(
        host="localhost",
        port=5432,
        dbname="mcq_generator",
        user="mcq_user",
        password="mcq12345"
    )

    print("Direct Psycopg connection successful!")
    connection.close()

except Exception as e:
    print("Connection failed!")
    print(e)
