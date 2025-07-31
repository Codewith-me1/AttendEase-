// "use client";

// import React, { useState } from "react";
// import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
// import Papa from "papaparse";
// import { createUserInFirestore } from "@/app/firebase/database";

// type Student = {
//   name: string;
//   email: string;
//   phone: string;
// };

// const AddStudents = () => {
//   const [students, setStudents] = useState<Student[]>([]);
//   const [csvUploading, setCsvUploading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [formData, setFormData] = useState<Student>({
//     name: "",
//     email: "",
//     phone: "",
//   });

//   const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await createStudent(formData);
//     setFormData({ name: "", email: "", phone: "" });
//   };

//   const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) setSelectedFile(file);
//   };

//   const handleCSVUpload = async () => {
//     if (!selectedFile) return;
//     setCsvUploading(true);

//     Papa.parse(selectedFile, {
//       header: true,
//       skipEmptyLines: true,
//       complete: async (results) => {
//         const parsed = results.data as Student[];
//         for (const student of parsed) {
//           if (student.email && student.name) {
//             await createStudent(student);
//           }
//         }
//         setCsvUploading(false);
//         setSelectedFile(null); // Reset file
//         alert("CSV Upload Complete!");
//       },
//     });
//   };

//   const createStudent = async ({ name, email, phone }: Student) => {
//     try {
//       const auth = getAuth();
//       const password = "defaultPass123"; // Or generate one
//       const { user } = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       await createUserInFirestore(user, "student", name, phone);
//       console.log(`Student ${name} created with email ${email}`);
//     } catch (err: any) {
//       console.error("Error creating student:", err.message);
//     }
//   };

//   return (
//     <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg">
//       <h2 className="text-xl font-semibold mb-4">Add Student</h2>

//       {/* Form Add */}
//       <form onSubmit={handleFormSubmit} className="space-y-4">
//         <input
//           type="text"
//           name="name"
//           placeholder="Name"
//           value={formData.name}
//           onChange={handleFormChange}
//           className="w-full p-2 border rounded"
//           required
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleFormChange}
//           className="w-full p-2 border rounded"
//           required
//         />
//         <input
//           type="text"
//           name="phone"
//           placeholder="Phone"
//           value={formData.phone}
//           onChange={handleFormChange}
//           className="w-full p-2 border rounded"
//         />
//         <button
//           type="submit"
//           className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
//         >
//           Add Student
//         </button>
//       </form>

//       {/* CSV Upload */}
//       <div className="mt-6">
//         <label className="block mb-2 font-medium">Upload CSV File:</label>
//         <input
//           type="file"
//           accept=".csv"
//           onChange={handleCSVChange}
//           className="block w-full"
//         />

//         {selectedFile && (
//           <button
//             onClick={handleCSVUpload}
//             className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//             disabled={csvUploading}
//           >
//             {csvUploading ? "Uploading..." : "Upload"}
//           </button>
//         )}

//         {csvUploading && (
//           <p className="text-sm text-gray-500 mt-2">Uploading CSV...</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AddStudents;

"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import Papa from "papaparse";
import { createUserInFirestore } from "@/app/firebase/database"; // Assuming this path is correct

// The Student type definition, expecting lowercase keys.
type Student = {
  name: string;
  email: string;
  phone: string;
};

const AddStudents = () => {
  // State for the form to add a single student
  const [formData, setFormData] = useState<Student>({
    name: "",
    email: "",
    phone: "",
  });

  // State for the CSV file upload process
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(""); // For showing success/error messages

  /**
   * Handles changes in the manual add student form.
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles the submission of the manual add student form.
   */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadMessage(""); // Clear previous messages
    await createStudent(formData);
    setUploadMessage(`Successfully added ${formData.name}.`);
    setFormData({ name: "", email: "", phone: "" }); // Reset form
  };

  /**
   * Stores the selected CSV file in state when the user chooses one.
   */
  const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadMessage(""); // Clear any previous messages when a new file is selected
    }
  };

  /**
   * Handles the logic for parsing the CSV and creating students.
   */
  const handleCSVUpload = async () => {
    if (!selectedFile) return;

    setCsvUploading(true);
    setUploadMessage("");

    // Use PapaParse to process the CSV file
    Papa.parse(selectedFile, {
      header: true, // Treat the first row as headers
      skipEmptyLines: true,
      // *** FIX: Transform headers to lowercase to match the 'Student' type keys ***
      transformHeader: (header) => header.toLowerCase().trim(),
      // Callback function when parsing is complete
      complete: async (results) => {
        const parsedStudents = results.data as Student[];
        let successCount = 0;
        let errorCount = 0;

        // Process each student record from the CSV
        for (const student of parsedStudents) {
          // Ensure the essential fields (name and email) are present
          if (student.email && student.name) {
            try {
              await createStudent(student);
              successCount++;
            } catch (error) {
              errorCount++;
            }
          }
        }

        // Update UI with the result
        setUploadMessage(
          `CSV processing complete. Added: ${successCount} students. Failed: ${errorCount}.`
        );
        setCsvUploading(false);
        setSelectedFile(null); // Reset the file input
      },
      // Handle any errors that occur during parsing
      error: (err: any) => {
        setCsvUploading(false);
        setUploadMessage(`Error parsing CSV file: ${err.message}`);
      },
    });
  };

  /**
   * Creates a user in Firebase Auth and then adds their details to Firestore.
   * @param {Student} student - The student object with name, email, and phone.
   */
  const createStudent = async ({ name, email, phone }: Student) => {
    try {
      const auth = getAuth();
      // NOTE: Using a default password is not recommended for production.
      // Consider sending a password reset email or generating a secure, unique password.
      const password = "defaultPass123";
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Assumes createUserInFirestore handles adding the user to your database
      await createUserInFirestore(user, "student", name, phone);
      console.log(`Student ${name} created with email ${email}`);
    } catch (err: any) {
      console.error(`Error creating student ${name} (${email}):`, err.message);
      // Re-throw the error to be caught by the caller if needed
      throw err;
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        Add Students
      </h1>

      {/* Form to Add a Single Student */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Add Manually
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleFormChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleFormChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number (Optional)"
            value={formData.phone}
            onChange={handleFormChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition transform hover:scale-105"
          >
            Add Student
          </button>
        </form>
      </div>

      {/* Divider */}
      <div className="flex items-center my-8">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-500 font-semibold">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      {/* CSV File Upload Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Upload from CSV
        </h2>
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />

          {selectedFile && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                File selected: <strong>{selectedFile.name}</strong>
              </p>
              <button
                onClick={handleCSVUpload}
                className="mt-3 w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={csvUploading}
              >
                {csvUploading ? "Uploading..." : "Upload and Create Students"}
              </button>
            </div>
          )}
        </div>

        {/* Display Upload Status/Result Message */}
        {uploadMessage && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-center">
            <p>{uploadMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddStudents;
