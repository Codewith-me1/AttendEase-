"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import Papa from "papaparse";

import { createUserInFirestore } from "@/app/firebase/database";
type Student = {
  name: string;
  email: string;
  phone: string;
};

const AddStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [csvUploading, setCsvUploading] = useState(false);
  const [formData, setFormData] = useState<Student>({
    name: "",
    email: "",
    phone: "",
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStudent(formData);
    setFormData({ name: "", email: "", phone: "" });
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsed = results.data as Student[];
        for (const student of parsed) {
          if (student.email && student.name) {
            await createStudent(student);
          }
        }
        setCsvUploading(false);
      },
    });
  };

  const createStudent = async ({ name, email, phone }: Student) => {
    try {
      const auth = getAuth();
      const password = "defaultPass123"; // Or generate a random one
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await createUserInFirestore(user, "student", name, phone);
      console.log(`Student ${name} created with email ${email}`);

      alert(`Student ${name} added and email sent!`);
    } catch (err: any) {
      console.error("Error creating student:", err.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Add Student</h2>

      {/* Form Add */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleFormChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleFormChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleFormChange}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Add Student
        </button>
      </form>

      {/* CSV Upload */}
      <div className="mt-6">
        <label className="block mb-2 font-medium">Upload CSV File:</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="block w-full"
        />
        {csvUploading && (
          <p className="text-sm text-gray-500 mt-2">Uploading CSV...</p>
        )}
      </div>
    </div>
  );
};

export default AddStudents;
