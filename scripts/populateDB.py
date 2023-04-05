import psycopg2
import json

db_host = "127.0.0.1"
db_name = "workout_app_2"
db_user = "postgres"
db_password = "postgres"

connection = psycopg2.connect(host=db_host, database=db_name, user=db_user, password=db_password, port=5432)

cursor = connection.cursor()
cursor.execute("SET search_path TO public")

with open('5day2k.json') as f:
    data = json.load(f)

workout_number = 1
while workout_number < 9:
    for muscle_group, workouts in data.items():
        # title = f"{muscle_group} - {workouts[(workout_number - 1) % 4]['workout']}"
        title = f"{muscle_group}"
        # capitalize the first letter of each word
        title = ' '.join([word[0].upper() + word[1:] for word in title.split(' ')])
 
        workout_str = ""
        for workout in workouts[(workout_number - 1) % 4]['exercises']:
            workout_str += f"""{workout['exercise']}
Sets: {workout['sets']}
Reps: {workout['reps']}

"""
        cursor.execute('INSERT INTO "Workout" (title, workout_str) VALUES (%s, %s)', (title, workout_str))
    workout_number += 1

connection.commit()
cursor.close()
connection.close()
