# 🏥 Direction – Clinic Management System (Doctor + Receptionist Portal)

https://direction-clinic-management-system.netlify.app

**Direction** is a lightweight, modular, and scalable **Clinic Workflow Management System** designed to streamline communication and task management between **Doctors** and **Receptionists**. It automates patient token generation, prescription sharing, billing, and patient history tracking — all stored securely in **Firebase**.

---

## 🧾 Problem Statement

The Direction system simplifies communication and record-keeping between **Receptionists** and **Doctors**. Receptionists generate patient tokens and enter personal data into the system. Doctors receive this data and add prescriptions. Both roles can access patient history anytime. The system aims to **eliminate manual records**, **reduce overhead**, and **ensure long-term access** to patient data and billing.

---

## 👥 User Roles & Capabilities

### 👨‍⚕️ Doctor Portal
- Login securely using Firebase Auth
- View current day's patient tokens
- Add prescription after patient visit
- View complete patient medical history

### 🧑‍💼 Receptionist Portal
- Login securely using Firebase Auth
- Add new patient entries and generate tokens automatically
- Input basic patient details (name, age, issue)
- View prescriptions submitted by doctor
- Generate bill and finalize patient checkout

---

## 🔍 Key Features

- 🔐 Role-based Firebase Authentication
- 🏷️ Auto Token Generation using timestamp-based logic
- 💊 Doctor Prescription Module
- 🧾 Billing Generator (based on receptionist submission)
- 🗂️ Persistent Patient History in Firestore
- 📜 Logging for each interaction (using JS logging utility)
- 📤 Firebase Firestore for secure cloud-hosted database
- 💅 Material UI for clean and accessible interfaces

---

## 🏗️ Project Modules (LLD Summary)

| Module           | Description                                                       |
|------------------|-------------------------------------------------------------------|
| Auth Module      | Firebase Auth for login (email/password), role-based routing     |
| Token Manager    | Generates token IDs using timestamp logic + patient info         |
| Patient Module   | Stores patient info, token, visit time, and prescription details |
| Doctor Panel     | Displays queued patients, adds prescriptions                     |
| Billing Module   | Final bill is created after doctor check + receptionist request  |
| History Viewer   | View patient medical history by either role                      |
| Logging System   | JS Logger for every mutation and access                          |

<!-- > See full [LLD document](architecture/ll-document.pdf) -->

---

## ⚙️ System Architecture

```plaintext
[React Client]
     ↓
[FIREBASE AUTH]
     ↓
[Role-based Routing]
     ↓
[Firestore (DB)] 
     ↓
[Logging System - JS Logger]
