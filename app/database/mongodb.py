# AegisNet MongoDB client & Mock database fallback manager

import os
import json
import logging
from typing import Dict, List, Any

# Configure logger
logger = logging.getLogger("aegisnet.database")

class AegisDatabase:
    def __init__(self):
        self.use_mock = True
        self.client = None
        self.db = None
        self.mock_file = os.path.join(os.path.dirname(__file__), "mock_mongodb.json")
        self.mock_data = {
            "patients": {},
            "vitals_history": [],
            "emergency_history": [],
            "prescriptions": [],
            "medication_adherence": {},
            "audit_registry": [],
            "notifications": [],
            "fcm_tokens": {},
            "notification_preferences": {}
        }
        self.bootstrap_db()

    def bootstrap_db(self):
        # 1. Attempt connection to real MongoDB
        mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
        try:
            from pymongo import MongoClient
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=1000)
            # Trigger server connection check
            self.client.server_info()
            self.db = self.client["aegisnet"]
            self.use_mock = False
            logger.info("Connected to MongoDB successfully.")
        except Exception as e:
            logger.warning(f"Could not connect to MongoDB ({e}). Falling back to local persisted file mock database.")
            self.load_mock_file()

    def load_mock_file(self):
        if os.path.exists(self.mock_file):
            try:
                with open(self.mock_file, "r") as f:
                    self.mock_data = json.load(f)
                logger.info(f"Loaded persisted database from {self.mock_file}")
            except Exception as e:
                logger.error(f"Failed to read mock file: {e}")
                self.save_mock_file()
        else:
            self.save_mock_file()
        
        # Check if seeding is needed
        if not self.mock_data.get("patients") or len(self.mock_data["patients"]) < 10:
            self.seed_mock_data()

    def seed_mock_data(self):
        logger.info("Seeding clinical mock patients data...")
        self.mock_data["patients"] = {}
        
        # Base demographics
        patients_list = [
            {
                "id": "P001",
                "name": "Savita Sharma",
                "age": 72,
                "gender": "Female",
                "email": "savita.sharma@gmail.com",
                "phone": "+91 98765 43210",
                "address": "B-402, Seawoods Towers, Sector 40, Navi Mumbai",
                "conditions": "Mild Hypertension, Post-Stroke mobility tracking",
                "allergies": "Penicillin",
                "medications": "Amlodipine 5mg morning, Atorvastatin 10mg night",
                "mobility_status": "Uses cane for outdoor walking",
                "risk_score": 12,
                "status": "Stable",
                "hr": 74,
                "spo2": 98,
                "temp": 36.6
            },
            {
                "id": "P002",
                "name": "Rajesh Kumar",
                "age": 67,
                "gender": "Male",
                "email": "rajesh.kumar@gmail.com",
                "phone": "+91 91122 33445",
                "address": "Flat 101, Om Residency, Sector 15, Vashi",
                "conditions": "Ischemic Heart Disease, Post-MI recovery",
                "allergies": "Sulfa drugs",
                "medications": "Aspirin 75mg daily, Metoprolol 25mg daily",
                "mobility_status": "Ambulatory, gait variation observed",
                "risk_score": 91,
                "status": "Critical",
                "hr": 112,
                "spo2": 94,
                "temp": 36.8
            },
            {
                "id": "P003",
                "name": "Anita Kumar",
                "age": 64,
                "gender": "Female",
                "email": "anita.kumar@gmail.com",
                "phone": "+91 92233 44556",
                "address": "A-12, Green Meadow Soc, Koparkhairane",
                "conditions": "Type 2 Diabetes, Diabetic Neuropathy",
                "allergies": "None",
                "medications": "Metformin 500mg morning, Teneligliptin 20mg afternoon",
                "mobility_status": "Ambulatory, experiences mild numbness",
                "risk_score": 56,
                "status": "Monitor",
                "hr": 92,
                "spo2": 95,
                "temp": 36.5
            },
            {
                "id": "P004",
                "name": "Lakshmi Iyer",
                "age": 80,
                "gender": "Female",
                "email": "lakshmi.iyer@gmail.com",
                "phone": "+91 93344 55667",
                "address": "Block C-34, Kalpataru Oasis, Sector 20, Kharghar",
                "conditions": "Osteoarthritis, Osteoporosis",
                "allergies": "NSAIDs",
                "medications": "Calcium Carbonate, Calcitriol supplements",
                "mobility_status": "Uses walker indoors, slow ambulatory pace",
                "risk_score": 15,
                "status": "Stable",
                "hr": 78,
                "spo2": 97,
                "temp": 36.4
            },
            {
                "id": "P005",
                "name": "Gopinath Pillai",
                "age": 82,
                "gender": "Male",
                "email": "gopinath.pillai@gmail.com",
                "phone": "+91 94455 66778",
                "address": "Penthouse B, Sky Heights, Sector 8, Nerul",
                "conditions": "Moderate Dementia, Mild Hypertension",
                "allergies": "Aspirin",
                "medications": "Donepezil 5mg night, Telmisartan 40mg morning",
                "mobility_status": "Supervised walking required",
                "risk_score": 88,
                "status": "Critical",
                "hr": 0,
                "spo2": 0,
                "temp": 0
            },
            {
                "id": "P006",
                "name": "Ananya Rao",
                "age": 65,
                "gender": "Female",
                "email": "ananya.rao@gmail.com",
                "phone": "+91 95566 77889",
                "address": "402-A, Shree Hills, Sector 3, CBD Belapur",
                "conditions": "Stable Angina, High Cholesterol",
                "allergies": "Contrast dye",
                "medications": "Nitroglycerin sublingual PRN, Atorvastatin 20mg",
                "mobility_status": "Fully ambulatory",
                "risk_score": 32,
                "status": "Stable",
                "hr": 82,
                "spo2": 98,
                "temp": 36.7
            },
            {
                "id": "P007",
                "name": "Vikram Mehta",
                "age": 71,
                "gender": "Male",
                "email": "vikram.mehta@gmail.com",
                "phone": "+91 96677 88990",
                "address": "Rowhouse 5, Palm Beach Gardens, Sanpada",
                "conditions": "Atrial Fibrillation, Chronic Kidney Disease Stage 3",
                "allergies": "Penicillin",
                "medications": "Apixaban 5mg twice daily, Bisoprolol 5mg",
                "mobility_status": "Ambulatory with caution",
                "risk_score": 45,
                "status": "Monitor",
                "hr": 86,
                "spo2": 96,
                "temp": 36.6
            },
            {
                "id": "P008",
                "name": "Sarla Devi",
                "age": 78,
                "gender": "Female",
                "email": "sarla.devi@gmail.com",
                "phone": "+91 97788 99001",
                "address": "Flat B-504, Valley View Apartments, Panvel",
                "conditions": "Mild Hypertension, Sarcopenia",
                "allergies": "Codeine",
                "medications": "Losartan 50mg morning, Vitamin D supplements",
                "mobility_status": "Ambulatory, uses cane for balance",
                "risk_score": 18,
                "status": "Stable",
                "hr": 70,
                "spo2": 97,
                "temp": 36.3
            },
            {
                "id": "P009",
                "name": "Devendra Nath",
                "age": 85,
                "gender": "Male",
                "email": "devendra.nath@gmail.com",
                "phone": "+91 98899 00112",
                "address": "G-3, Silver Arch, Sector 2, Airoli",
                "conditions": "Parkinson's Disease, Orthostatic Hypotension",
                "allergies": "None",
                "medications": "Levodopa/Carbidopa 100/25mg thrice daily",
                "mobility_status": "High fall risk, uses walking frame",
                "risk_score": 94,
                "status": "Critical",
                "hr": 98,
                "spo2": 93,
                "temp": 36.8
            },
            {
                "id": "P010",
                "name": "Meera Nair",
                "age": 69,
                "gender": "Female",
                "email": "meera.nair@gmail.com",
                "phone": "+91 99900 11223",
                "address": "C-12, Sea Breeze, Sector 19, Airoli",
                "conditions": "Hypothyroidism, Post-surgical knee stability",
                "allergies": "Latex",
                "medications": "Thyroxine 75mcg daily",
                "mobility_status": "Ambulatory",
                "risk_score": 24,
                "status": "Stable",
                "hr": 72,
                "spo2": 98,
                "temp": 36.5
            }
        ]

        for p in patients_list:
            email = p["email"]
            patient_record = {
                "id": p["id"],
                "email": email,
                "profile": {
                    "id": p["id"],
                    "name": p["name"],
                    "dob": f"{1950 + int(p['id'][3])}-01-01",  # mock DOB
                    "age": p["age"],
                    "gender": p["gender"],
                    "phone": p["phone"],
                    "email": email,
                    "address": p["address"],
                    "emergency_location": p["address"],
                    "height": 160 + (p["age"] % 15),
                    "weight": 55 + (p["age"] % 25),
                    "bmi": round((55 + (p["age"] % 25)) / ((160 + (p["age"] % 15))/100)**2, 1),
                    "blood_group": p.get("blood_group", "O+"),
                    "conditions": p["conditions"],
                    "allergies": p["allergies"],
                    "surgeries": "None logged",
                    "medications": p["medications"],
                    "mobility_status": p["mobility_status"],
                    "fall_history": "None",
                    "lifestyle": "Sedentary"
                },
                "contacts": [
                    {"name": "Rahul Sharma" if p["id"] == "P001" else "Guardian Monitor", "relationship": "Son / Guardian", "phone": "+91 99887 76655", "email": "rahul.sharma@gmail.com"},
                    {"name": "Dr. Arvind Swamy", "relationship": "Primary Cardiologist", "phone": "+91 91234 56789", "email": "arvind.swamy@narayana.org", "hospital": "Narayana Health Clinic"}
                ],
                "device_id": f"AEGIS-GATEWAY-10{p['id'][3]}",
                "risk_score": p["risk_score"],
                "status": p["status"],
                "vitals": {
                    "heartRate": p["hr"],
                    "spo2": p["spo2"],
                    "temperature": p["temp"],
                    "activity": "Resting" if p["status"] == "Stable" else "Inactive" if p["status"] == "Critical" else "Walking",
                    "respirationRate": 16 if p["hr"] > 0 else 0,
                    "radarHeartRate": p["hr"] - 1 if p["hr"] > 0 else 0,
                    "radarRespiration": 16 if p["hr"] > 0 else 0
                }
            }
            self.mock_data["patients"][email] = patient_record
            
        # Seed default clinical notes
        self.mock_data["doctor_notes"] = [
            {
                "id": "N-01",
                "patient_id": "P001",
                "doctor_name": "Dr. Arvind Swamy",
                "date": "2026-08-10",
                "patient_visible": "Continue monitoring activity and attend follow-up.",
                "private_note": "Activity deviation observed over last 48 hours. Heart rate variance within tolerance.",
                "timestamp": 1787320000.0
            }
        ]

        # Seed clinical appointments
        self.mock_data["appointments"] = [
            {
                "id": "A-01",
                "patient_id": "P001",
                "patient_name": "Savita Sharma",
                "time": "09:30 AM",
                "reason": "Follow-up Cardiology baseline validation",
                "status": "Upcoming"
            },
            {
                "id": "A-02",
                "patient_id": "P002",
                "patient_name": "Rajesh Kumar",
                "time": "10:15 AM",
                "reason": "Post-fall clinical safety assessment",
                "status": "Upcoming"
            }
        ]

        # Seed default guardians
        self.mock_data["guardians"] = [
            {
                "email": "rahul.sharma@gmail.com",
                "phone": "+91 99887 76655",
                "password": "guardian123",
                "name": "Rahul Sharma",
                "relations": ["P001", "P002", "P003"]
            }
        ]

        # Seed guardian consents/privacy scopes
        self.mock_data["guardians_consents"] = [
            {
                "patient_id": "P001",
                "guardian_email": "rahul.sharma@gmail.com",
                "scopes": {
                    "health_summary": True,
                    "vitals": True,
                    "location": "emergency_only",
                    "prescriptions": True,
                    "doctor_notes": False,
                    "radar": "summary_only",
                    "camera": False
                }
            },
            {
                "patient_id": "P002",
                "guardian_email": "rahul.sharma@gmail.com",
                "scopes": {
                    "health_summary": True,
                    "vitals": True,
                    "location": "always",
                    "prescriptions": True,
                    "doctor_notes": False,
                    "radar": "detailed",
                    "camera": False
                }
            },
            {
                "patient_id": "P003",
                "guardian_email": "rahul.sharma@gmail.com",
                "scopes": {
                    "health_summary": True,
                    "vitals": True,
                    "location": "emergency_only",
                    "prescriptions": True,
                    "doctor_notes": False,
                    "radar": "summary_only",
                    "camera": False
                }
            }
        ]

        # Save to mock file
        self.save_mock_file()

    def save_mock_file(self):
        try:
            with open(self.mock_file, "w") as f:
                json.dump(self.mock_data, f, indent=4)
        except Exception as e:
            logger.error(f"Failed to write mock database: {e}")

    # Helper methods for Collection Operations
    def insert_one(self, collection: str, data: Dict[str, Any]) -> str:
        if not self.use_mock:
            col = self.db[collection]
            res = col.insert_one(data)
            return str(res.inserted_id)
        else:
            if collection not in self.mock_data:
                self.mock_data[collection] = []
            
            # If inserting patient, key by email or id
            if collection == "patients":
                email = data.get("email")
                self.mock_data["patients"][email] = data
            else:
                if isinstance(self.mock_data[collection], dict):
                    # Keyed dictionary
                    key = data.get("id") or str(len(self.mock_data[collection]) + 1)
                    self.mock_data[collection][key] = data
                else:
                    self.mock_data[collection].append(data)
            
            self.save_mock_file()
            return data.get("email") or "success"

    def find_one(self, collection: str, query: Dict[str, Any]) -> Any:
        if not self.use_mock:
            return self.db[collection].find_one(query)
        else:
            if collection == "patients":
                email = query.get("email")
                if email:
                    return self.mock_data["patients"].get(email)
                
                # Check for ID filters
                patient_id = query.get("id") or query.get("patient_id")
                if patient_id:
                    for k, v in self.mock_data["patients"].items():
                        prof = v.get("profile", {})
                        if prof.get("id") == patient_id or v.get("id") == patient_id:
                            return v
                return None
            else:
                items = self.mock_data.get(collection, [])
                if isinstance(items, dict):
                    # Keyed search
                    for k, v in items.items():
                        if all(v.get(key) == val for key, val in query.items()):
                            return v
                else:
                    for item in items:
                        if all(item.get(key) == val for key, val in query.items()):
                            return item
            return None

    def find_many(self, collection: str, query: Dict[str, Any] = {}) -> List[Any]:
        if not self.use_mock:
            return list(self.db[collection].find(query))
        else:
            if collection == "patients":
                # Return all patients as list
                return list(self.mock_data["patients"].values())
                
            items = self.mock_data.get(collection, [])
            if isinstance(items, dict):
                results = []
                for k, v in items.items():
                    if all(v.get(key) == val for key, val in query.items()):
                        results.append(v)
                return results
            else:
                if not query:
                    return items
                results = []
                for item in items:
                    if all(item.get(key) == val for key, val in query.items()):
                        results.append(item)
                return results

    def update_one(self, collection: str, query: Dict[str, Any], update_data: Dict[str, Any]) -> bool:
        if not self.use_mock:
            col = self.db[collection]
            res = col.update_one(query, {"$set": update_data})
            return res.modified_count > 0
        else:
            if collection == "patients":
                email = query.get("email")
                if email in self.mock_data["patients"]:
                    self.mock_data["patients"][email].update(update_data)
                    self.save_mock_file()
                    return True
            else:
                items = self.mock_data.get(collection, [])
                if isinstance(items, dict):
                    for k, v in items.items():
                        if all(v.get(key) == val for key, val in query.items()):
                            self.mock_data[collection][k].update(update_data)
                            self.save_mock_file()
                            return True
                else:
                    for item in items:
                        if all(item.get(key) == val for key, val in query.items()):
                            item.update(update_data)
                            self.save_mock_file()
                            return True
            return False

# Export instance
db_client = AegisDatabase()
