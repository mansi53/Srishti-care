# server.py
import os
import sys
import subprocess
import time
import json
import random
import threading
from datetime import datetime

# ----------------- AUTO-INSTALL MISSING PACKAGES -----------------
def install_python_dependencies():
    required = ["fastapi", "uvicorn", "httpx", "python-dotenv"]
    missing = []
    for pkg in required:
        try:
            # Check import by resolving hyphens to underscores
            __import__(pkg.replace("-", "_"))
        except ImportError:
            missing.append(pkg)
    if missing:
        print(f"[Python Bootstrap] Installing missing python dependencies: {missing}...", flush=True)
        try:
            subprocess.run([sys.executable, "-m", "pip", "install"] + missing, check=True)
            print("[Python Bootstrap] Installation successful!", flush=True)
        except Exception as e:
            print(f"[Python Bootstrap] Fatal: Failed to install python dependencies {e}", flush=True)

install_python_dependencies()

from fastapi import FastAPI, Request, status, Response, Body
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
import httpx

# Load env variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = FastAPI(title="Sristi Cares Python API Server")

# ----------------- IN-MEMORY SEED DATA -----------------
doctors = [
    {
        "doctor_id": "doc-1",
        "name": "Dr. Suman Saini",
        "specialization": "General Medicine",
        "experience": 12,
        "availability": "09:00 AM - 01:00 PM",
        "room_number": "Room 101"
    },
    {
        "doctor_id": "doc-2",
        "name": "Dr. Rahul Malhotra",
        "specialization": "Cardiology",
        "experience": 15,
        "availability": "10:00 AM - 04:00 PM",
        "room_number": "Room 105"
    },
    {
        "doctor_id": "doc-3",
        "name": "Dr. Ananya Iyer",
        "specialization": "Pediatrics",
        "experience": 8,
        "availability": "11:00 AM - 03:00 PM",
        "room_number": "Room 202"
    },
    {
        "doctor_id": "doc-4",
        "name": "Dr. Vikram Seth",
        "specialization": "Dermatology",
        "experience": 10,
        "availability": "02:00 PM - 06:00 PM",
        "room_number": "Room 208"
    }
]

patients = [
    {
        "patient_id": "pat-1",
        "name": "Rajesh Kumar",
        "email": "rajesh@example.com",
        "phone": "+91 98765 43210",
        "age": 34,
        "gender": "Male"
    },
    {
        "patient_id": "pat-2",
        "name": "Neelam Sharma",
        "email": "neelam@example.com",
        "phone": "+91 87654 32109",
        "age": 28,
        "gender": "Female"
    }
]

appointments = [
    {
        "appointment_id": "apt-1",
        "patient_id": "pat-1",
        "doctor_id": "doc-1",
        "appointment_date": datetime.now().strftime("%Y-%m-%d"),
        "appointment_time": "10:30 AM",
        "status": "Completed",
        "created_at": datetime.utcnow().isoformat() + "Z"
    },
    {
        "appointment_id": "apt-2",
        "patient_id": "pat-2",
        "doctor_id": "doc-1",
        "appointment_date": datetime.now().strftime("%Y-%m-%d"),
        "appointment_time": "11:00 AM",
        "status": "In Consultation",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
]

queues = [
    {
        "queue_id": "q-1",
        "appointment_id": "apt-1",
        "patient_id": "pat-1",
        "doctor_id": "doc-1",
        "queue_number": 1,
        "queue_status": "Completed",
        "estimated_wait_time": 0,
        "created_at": datetime.utcnow().isoformat() + "Z"
    },
    {
        "queue_id": "q-2",
        "appointment_id": "apt-2",
        "patient_id": "pat-2",
        "doctor_id": "doc-1",
        "queue_number": 2,
        "queue_status": "In Consultation",
        "estimated_wait_time": 5,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
]

# ----------------- QUEUE HELPER -----------------
def update_estimated_times(doc_id):
    doctor_active_queues = [
        q for q in queues
        if q["doctor_id"] == doc_id and q["queue_status"] in ["Waiting", "In Consultation"]
    ]
    doctor_active_queues.sort(key=lambda x: x["queue_number"])

    wait_accumulator = 0
    for q in doctor_active_queues:
        if q["queue_status"] == "In Consultation":
            q["estimated_wait_time"] = 5
            wait_accumulator = 5
        else:
            wait_accumulator += 15
            q["estimated_wait_time"] = wait_accumulator

# ----------------- REST API ROUTES -----------------

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "Sristi Cares Python API Server",
        "active_doctors": len(doctors)
    }

@app.post("/api/patients/register")
async def register_patient(payload: dict = Body(...)):
    name = payload.get("name")
    email = payload.get("email")
    phone = payload.get("phone")
    age = payload.get("age")
    gender = payload.get("gender")

    if not name or not email or not phone:
        return JSONResponse(
            status_code=400,
            content={"error": "Missing required registration parameters"}
        )

    existing = next((p for p in patients if p["email"].lower() == email.lower()), None)
    if existing:
        return {
            "success": True,
            "patient": existing,
            "message": "Patient registered previously"
        }

    try:
        parsed_age = int(age)
    except (TypeError, ValueError):
        parsed_age = 30

    new_patient = {
        "patient_id": f"pat-{int(time.time() * 1000)}",
        "name": name,
        "email": email,
        "phone": phone,
        "age": parsed_age,
        "gender": gender or "Other"
    }
    patients.append(new_patient)
    return {
        "success": True,
        "patient": new_patient,
        "message": "A new patient record was generated successfully!"
    }

@app.post("/api/patients/login")
async def login_patient(payload: dict = Body(...)):
    email = payload.get("email")
    if not email:
        return JSONResponse(
            status_code=400,
            content={"error": "Email parameter is required for Sristi Patient ID lookup"}
        )

    patient = next((p for p in patients if p["email"].lower() == email.lower()), None)
    if patient:
        return {"success": True, "patient": patient}
    else:
        prefix = email.split('@')[0]
        cleaned_name = "".join(c for c in prefix if c.isalpha() or c.isspace()).replace("  ", " ").strip()
        display_name = cleaned_name.title() if cleaned_name else "Guest Patient"

        auto_patient = {
            "patient_id": f"pat-{int(time.time() * 1000)}",
            "name": display_name,
            "email": email,
            "phone": "+91 91111 22222",
            "age": 25,
            "gender": "Male"
        }
        patients.append(auto_patient)
        return {
            "success": True,
            "patient": auto_patient,
            "message": "Account generated dynamically upon sign-in!"
        }

@app.get("/api/doctors")
def get_doctors():
    return doctors

@app.get("/api/patients")
def get_patients():
    return patients

@app.post("/api/appointments/book")
async def book_appointment(payload: dict = Body(...)):
    patient_id = payload.get("patient_id")
    doctor_id = payload.get("doctor_id")
    appointment_date = payload.get("appointment_date")
    appointment_time = payload.get("appointment_time")

    if not patient_id or not doctor_id:
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid parameters. Both Patient & Doctor IDs are required."}
        )

    doctor = next((d for d in doctors if d["doctor_id"] == doctor_id), None)
    patient = next((p for p in patients if p["patient_id"] == patient_id), None)

    if not doctor or not patient:
        return JSONResponse(
            status_code=404,
            content={"error": "Patient or Doctor record not found."}
        )

    appt_id = f"apt-{int(time.time() * 1000)}"
    new_appt = {
        "appointment_id": appt_id,
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "appointment_date": appointment_date or datetime.now().strftime("%Y-%m-%d"),
        "appointment_time": appointment_time or "12:00 PM",
        "status": "Waiting",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    doctor_today_apts = [a for a in appointments if a["doctor_id"] == doctor_id]
    next_q_num = len(doctor_today_apts) + 1

    new_q_entry = {
        "queue_id": f"q-{int(time.time() * 1000)}",
        "appointment_id": appt_id,
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "queue_number": next_q_num,
        "queue_status": "Waiting",
        "estimated_wait_time": 15,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    appointments.append(new_appt)
    queues.append(new_q_entry)

    update_estimated_times(doctor_id)

    matched_queue = next((q for q in queues if q["queue_id"] == new_q_entry["queue_id"]), None)

    return {
        "success": True,
        "appointment": new_appt,
        "queue": matched_queue
    }

@app.get("/api/queue")
def get_queue():
    return queues

@app.get("/api/queue/patient/{patient_id}")
def get_patient_queue(patient_id: str):
    patient_queue_entries = [q for q in queues if q["patient_id"] == patient_id]
    enriched_trackers = []

    for q in patient_queue_entries:
        doctor = next((d for d in doctors if d["doctor_id"] == q["doctor_id"]), None)
        appointment = next((a for a in appointments if a["appointment_id"] == q["appointment_id"]), None)

        list_for_doctor = [
            entry for entry in queues
            if entry["doctor_id"] == q["doctor_id"] and entry["queue_status"] in ["Waiting", "In Consultation"]
        ]
        list_for_doctor.sort(key=lambda x: x["queue_number"])

        try:
            position_idx = next(i for i, entry in enumerate(list_for_doctor) if entry["queue_id"] == q["queue_id"])
            people_ahead = position_idx if position_idx > 0 else 0
        except StopIteration:
            people_ahead = 0

        current_on_duty = next((entry for entry in list_for_doctor if entry["queue_status"] == "In Consultation"), None)
        if not current_on_duty:
            current_on_duty = next((entry for entry in list_for_doctor if entry["queue_status"] == "Waiting"), None)

        current_serving_number = 0
        current_serving_name = "None"

        if current_on_duty:
            current_serving_number = current_on_duty["queue_number"]
            serving_patient = next((p for p in patients if p["patient_id"] == current_on_duty["patient_id"]), None)
            current_serving_name = serving_patient["name"] if serving_patient else "Unknown"

        if q["queue_status"] == "Waiting":
            est_time = people_ahead * 15 + 5
        elif q["queue_status"] == "In Consultation":
            est_time = 5
        else:
            est_time = 0

        enriched_trackers.append({
            "queue_id": q["queue_id"],
            "appointment_id": q["appointment_id"],
            "doctor_name": doctor["name"] if doctor else "Dr. Specialist",
            "specialization": doctor["specialization"] if doctor else "General Medicine",
            "room_number": doctor["room_number"] if doctor else "TBA",
            "queue_number": q["queue_number"],
            "queue_status": q["queue_status"],
            "people_ahead": people_ahead,
            "current_patient_number": current_serving_number,
            "current_patient_name": current_serving_name,
            "estimated_wait_time": est_time,
            "appointment_status": appointment["status"] if appointment else "Waiting"
        })

    return enriched_trackers

@app.post("/api/doctor/queue/action")
async def doctor_queue_action(payload: dict = Body(...)):
    doctor_id = payload.get("doctor_id")
    queue_id = payload.get("queue_id")
    action = payload.get("action")

    if not queue_id or not action:
        return JSONResponse(
            status_code=400,
            content={"error": "Queue ID and Action type are required"}
        )

    target_queue = next((q for q in queues if q["queue_id"] == queue_id), None)
    if not target_queue:
        return JSONResponse(
            status_code=404,
            content={"error": "Queue entry match identifier not found"}
        )

    target_doc_id = doctor_id or target_queue["doctor_id"]

    if action == "start":
        for q in queues:
            if q["doctor_id"] == target_doc_id and q["queue_status"] == "In Consultation":
                q["queue_status"] = "Completed"
                matched_apt = next((a for a in appointments if a["appointment_id"] == q["appointment_id"]), None)
                if matched_apt:
                    matched_apt["status"] = "Completed"

        target_queue["queue_status"] = "In Consultation"
        matched_apt = next((a for a in appointments if a["appointment_id"] == target_queue["appointment_id"]), None)
        if matched_apt:
            matched_apt["status"] = "In Consultation"

    elif action == "complete":
        target_queue["queue_status"] = "Completed"
        matched_apt = next((a for a in appointments if a["appointment_id"] == target_queue["appointment_id"]), None)
        if matched_apt:
            matched_apt["status"] = "Completed"

    elif action in ["skip", "cancel"]:
        target_queue["queue_status"] = "Completed"
        matched_apt = next((a for a in appointments if a["appointment_id"] == target_queue["appointment_id"]), None)
        if matched_apt:
            matched_apt["status"] = "Cancelled"

    update_estimated_times(target_doc_id)
    return {"success": True, "message": f"Advanced queue with action: {action}"}

@app.get("/api/admin/stats")
def get_admin_stats():
    total = len(appointments)
    completed = len([a for a in appointments if a["status"] == "Completed"])
    waiting = len([q for q in queues if q["queue_status"] == "Waiting"])
    active_consults = len([q for q in queues if q["queue_status"] == "In Consultation"])
    cancelled = len([a for a in appointments if a["status"] == "Cancelled"])

    return {
        "total_appointments": total,
        "completed_consultations": completed,
        "waiting_patients": waiting,
        "active_consultations": active_consults,
        "cancelled_appointments": cancelled,
        "doctors_count": len(doctors),
        "patients_count": len(patients)
    }

@app.post("/api/admin/doctor/add")
async def add_doctor(payload: dict = Body(...)):
    name = payload.get("name")
    specialization = payload.get("specialization")
    experience = payload.get("experience")
    availability = payload.get("availability")
    room_number = payload.get("room_number")

    if not name or not specialization:
        return JSONResponse(
            status_code=400,
            content={"error": "Missing doctor specifications"}
        )

    try:
        parsed_exp = int(experience)
    except (TypeError, ValueError):
        parsed_exp = 5

    new_doc = {
        "doctor_id": f"doc-{int(time.time() * 1000)}",
        "name": name,
        "specialization": specialization,
        "experience": parsed_exp,
        "availability": availability or "09:00 AM - 05:00 PM",
        "room_number": room_number or "Room Suite"
    }
    doctors.append(new_doc)
    return {"success": True, "doctor": new_doc}

@app.post("/api/admin/doctor/delete")
async def delete_doctor(payload: dict = Body(...)):
    global doctors
    doctor_id = payload.get("doctor_id")
    doctors = [d for d in doctors if d["doctor_id"] != doctor_id]
    return {"success": True}

@app.post("/api/queue/simulate")
async def simulate_queue(payload: dict = Body(...)):
    doctor_id = payload.get("doctor_id") or "doc-1"

    random_names = ["Devendra Saini", "Shreya Verma", "Karan Johar", "Manisha Koirala", "Aaditya Malhotra", "Pranav Roy"]
    selected_name = random.choice(random_names)
    random_age = random.randint(18, 68)
    random_gender = "Male" if random.random() > 0.5 else "Female"

    p_id = f"pat-sim-{int(time.time() * 1000)}"
    sim_patient = {
        "patient_id": p_id,
        "name": selected_name,
        "email": f"{selected_name.lower().replace(' ', '')}@simulated.com",
        "phone": "+91 99000 88000",
        "age": random_age,
        "gender": random_gender
    }
    patients.append(sim_patient)

    a_id = f"apt-sim-{int(time.time() * 1000)}"
    mock_apt = {
        "appointment_id": a_id,
        "patient_id": p_id,
        "doctor_id": doctor_id,
        "appointment_date": datetime.now().strftime("%Y-%m-%d"),
        "appointment_time": "Simulation Time",
        "status": "Waiting",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    doctor_active_apts = [a for a in appointments if a["doctor_id"] == doctor_id]
    next_q_num = len(doctor_active_apts) + 1

    mock_queue = {
        "queue_id": f"q-sim-{int(time.time() * 1000)}",
        "appointment_id": a_id,
        "patient_id": p_id,
        "doctor_id": doctor_id,
        "queue_number": next_q_num,
        "queue_status": "Waiting",
        "estimated_wait_time": 15,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    appointments.append(mock_apt)
    queues.append(mock_queue)

    update_estimated_times(doctor_id)

    return {
        "success": True,
        "patient_name": selected_name,
        "queue_number": next_q_num
    }

# ----------------- VITE PROXY / STATIC FILE SERVING -----------------

@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def catch_all_proxy(request: Request, path_name: str):
    # Protect API route lookups from leaking to Vite proxy handler
    if path_name.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})

    # Check if in Node Production mode (Vite files will be prebuilt to dist/)
    if os.environ.get("NODE_ENV") == "production":
        dist_path = os.path.join(os.getcwd(), "dist")
        target_file = os.path.join(dist_path, path_name)

        if not path_name or path_name == "/":
            return FileResponse(os.path.join(dist_path, "index.html"))

        if os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)

        # Fallback to index.html pattern for Single Page App router
        return FileResponse(os.path.join(dist_path, "index.html"))
    else:
        # In Development mode, proxy non-API requests asynchronously to the Vite dev server running internally on port 5173
        client = httpx.AsyncClient(base_url="http://127.0.0.1:5173")
        url = request.url.path
        if request.url.query:
            url += f"?{request.url.query}"

        body = await request.body()
        headers = dict(request.headers)
        if "host" in headers:
            # Let HTTPX build correct host/port mapping for background port
            del headers["host"]

        try:
            resp = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body
            )
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                headers=dict(resp.headers)
            )
        except Exception as e:
            # Graceful recovery if Vite service is boot-spinning
            return HTMLResponse(
                f"<div style='font-family: sans-serif; text-align: center; margin-top: 100px; color: #4b5563;'>"
                f"<h2>Initializing Dev Environment</h2>"
                f"<p>Connecting Python FastAPI proxy middleware to Vite frontend assets server... ({str(e)})</p>"
                f"<div style='display: inline-block; width: 30px; height: 30px; border: 3px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animate: spin 1s linear infinite;'></div>"
                f"<script>setTimeout(() => location.reload(), 1500);</script>"
                f"</div>"
                f"<style>@keyframes spin {{ to {{ transform: rotate(360deg); }} }}</style>",
                status_code=503
            )

# Spawn Vite Development Asset compiler on background daemon thread in local non-production environments
def spawn_vite_background():
    print("[Python Backend] Spawning Vite Assets Service on internal Port 5173...", flush=True)
    env_copy = os.environ.copy()
    try:
        # Spawn Vite inside the same directory, specifically targeting port 5173, strictPort mode and local loopback path bind
        subprocess.run(["npx", "vite", "--port", "5173", "--strictPort", "--host", "127.0.0.1"], env=env_copy)
    except Exception as e:
        print(f"[Python Backend] Vite failed to spawn or run: {e}", flush=True)

if os.environ.get("NODE_ENV") != "production":
    vite_thread = threading.Thread(target=spawn_vite_background, daemon=True)
    vite_thread.start()

# ----------------- SERVER BOOTSTRAP -----------------
if __name__ == "__main__":
    import uvicorn
    # Bind directly to Port 3000 and interface 0.0.0.0, enabling cloud application proxies to securely surface the platform
    uvicorn.run("server:app", host="0.0.0.0", port=3000, log_level="info")
