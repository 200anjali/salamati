import logging
from flask import Flask, request
from flask_cors import CORS
from urllib.parse import urlencode, quote
import firebase_admin
from firebase_admin import credentials, firestore, initialize_app, messaging
from google.cloud import firestore

cred = credentials.Certificate("/Users/anjaliraj/Desktop/Salamati-server/serviceAccountKeys.json")
default_app = initialize_app(cred)
db = firestore.Client()
def get_fcm_tokens_by_phone_number(phone_number):
    try:
        user_details_ref = db.collection('user_details').where('phone_number', '==', phone_number).stream()
        fcm_tokens=""

        for user_doc in user_details_ref:
            user_data = user_doc.to_dict()
            fcm_token = user_data.get('fcm_token')
            if fcm_token:
                fcm_tokens=fcm_token

        return fcm_tokens

    except Exception as e:
        print(f"Error retrieving FCM tokens for phone number {phone_number}: {str(e)}")
        return None


def get_sos_contact_details(user_id):
    try:
        sos_contact_ref = db.collection('sos_contact_details').document(user_id)
        sos_contact_data = sos_contact_ref.get().to_dict()

        if not sos_contact_data or 'phoneNumbers' not in sos_contact_data:
            return None  # Handle the case where the document or phoneNumbers field is missing

        phone_numbers = sos_contact_data['phoneNumbers']
        return phone_numbers
    except Exception as e:
        print(f"Error retrieving SOS contact details for user {user_id}: {str(e)}")
        return None
app = Flask(__name__)
CORS(app)

@app.route("/send_notification/<user_id>/<user_name>/<latitude>/<longitude>", methods=["GET"])
def get_sos_contacts(user_id,user_name,latitude,longitude):
    url = f"https://www.google.com/maps?q={quote(latitude)},{quote(longitude)}"
    header = f"Emergency Alert from {user_name}"
    body = url
    notification = messaging.Notification(
                    title=header,
                    body=body,
                )
    phone_numbers = get_sos_contact_details(user_id)

    if phone_numbers is not None:
        for phone_number in phone_numbers:
            fcm_token = get_fcm_tokens_by_phone_number(phone_number)
            if fcm_token is not None and fcm_token != "":
                message = messaging.Message(
                    data={
                        'header': header,
                        'body': body,
                        'link': url,
                        'action': 'OPEN_MAP',
                    },
                    notification=notification, 
                    token=fcm_token,
                )
                response = messaging.send(message)
                print(response)
                print(f"FCM Token found: {fcm_token}")
            else:
                print("FCM Token not found.")
        return {"message": "Successfully send notifications."}, 200
    else:
        return {"error": "Failed to retrieve SOS contact details."}, 500


if __name__ == "__main__":
    app.run(port=8000)


# To start the ngork
# ngrok http http://localhost:8000




