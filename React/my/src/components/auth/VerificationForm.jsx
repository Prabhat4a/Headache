import React, { useState, useRef } from "react";

const VerificationForm = ({ userData, onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    branch: "",
    year: "",
  });
  const [errors, setErrors] = useState({});
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef(null);

  // Simulated existing users
  const existingUsers = [
    {
      name: "John Doe",
      roll: "CS2024001",
      email: "john@gmail.com",
      phone: "9876543210",
    },
    {
      name: "Jane Smith",
      roll: "EC2024002",
      email: "jane@gmail.com",
      phone: "8765432109",
    },
    {
      name: "Mike Johnson",
      roll: "EE2024003",
      email: "mike@yahoo.com",
      phone: "7654321098",
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setAvatar(e.target.result);
    reader.readAsDataURL(file);
  };

  const checkDuplicates = () => {
    const duplicates = [];
    for (let user of existingUsers) {
      if (user.name.toLowerCase() === formData.name.toLowerCase())
        duplicates.push("Name");
      if (user.roll.toLowerCase() === formData.roll.toLowerCase())
        duplicates.push("Roll Number");
      if (user.email.toLowerCase() === (userData?.email || "").toLowerCase())
        duplicates.push("Email");
      if (user.phone === (userData?.phone || ""))
        duplicates.push("Phone Number");
    }
    return duplicates;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Please enter your full name";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Validate roll
    if (!formData.roll.trim()) {
      newErrors.roll = "Please enter roll number";
    } else if (formData.roll.trim().length < 5) {
      newErrors.roll = "Roll number must be at least 5 characters";
    }

    // Validate branch
    if (!formData.branch) {
      newErrors.branch = "Please select your branch";
    }

    // Validate year
    if (!formData.year) {
      newErrors.year = "Please select your year";
    }

    // Check duplicates
    if (Object.keys(newErrors).length === 0) {
      const duplicates = checkDuplicates();
      if (duplicates.length > 0) {
        alert(
          "⚠️ Registration Failed!\n\nThe following data already exists:\n" +
            duplicates.join(", ") +
            "\n\nPlease use different information.",
        );
        if (duplicates.includes("Name"))
          newErrors.name = "This name is already registered";
        if (duplicates.includes("Roll Number"))
          newErrors.roll = "This roll number is already registered";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Success
    alert(
      "✅ Registration Successful!\n\nYour account has been created. Please login with your credentials.",
    );
    onComplete();
  };

  const removePhoto = () => {
    setAvatar(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="verification-section" style={{ display: "flex" }}>
      <div className="verification-box">
        <div className="box-head-verify">
          <h1>Complete Your Profile</h1>
          <p className="subtitle">Just a few more details to get started</p>
        </div>

        <form id="verificationForm" onSubmit={handleSubmit}>
          <div className="avatar-upload-section">
            <div
              className="avatar-circle"
              onClick={() => fileInputRef.current?.click()}
            >
              {!avatar ? (
                <div className="avatar-placeholder">
                  <i className="bx bx-user-circle"></i>
                </div>
              ) : (
                <img
                  src={avatar}
                  alt="Profile"
                  className="avatar-preview-img"
                />
              )}
              <div className="avatar-overlay">
                <i className="bx bx-camera"></i>
                <span>Change</span>
              </div>
            </div>
            <p className="avatar-label">
              Profile Photo <span className="optional">· Optional</span>
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg"
              hidden
              onChange={handleFileUpload}
            />
          </div>

          <div className="form-row">
            <div className="input-box">
              <label>Full Name</label>
              <div className="input-wrapper">
                <i className="bx bx-user"></i>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className={errors.name ? "error" : ""}
                />
              </div>
              <div className={`error-message ${errors.name ? "show" : ""}`}>
                {errors.name}
              </div>
            </div>
            <div className="input-box">
              <label>Roll Number</label>
              <div className="input-wrapper">
                <i className="bx bx-id-card"></i>
                <input
                  type="text"
                  value={formData.roll}
                  onChange={(e) => handleInputChange("roll", e.target.value)}
                  placeholder="Enter roll number"
                  className={errors.roll ? "error" : ""}
                />
              </div>
              <div className={`error-message ${errors.roll ? "show" : ""}`}>
                {errors.roll}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="input-box">
              <label>Branch</label>
              <div className="input-wrapper">
                <i className="bx bx-book"></i>
                <select
                  value={formData.branch}
                  onChange={(e) => handleInputChange("branch", e.target.value)}
                  className={errors.branch ? "error" : ""}
                >
                  <option value="">Select Branch</option>
                  <option value="CSE">Computer Science Engineering</option>
                  <option value="ECE">Electronics & Communication</option>
                  <option value="EEE">Electrical & Electronics</option>
                  <option value="MECH">Mechanical Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="IT">Information Technology</option>
                  <option value="AI-ML">AI & Machine Learning</option>
                  <option value="DS">Data Science</option>
                </select>
              </div>
              <div className={`error-message ${errors.branch ? "show" : ""}`}>
                {errors.branch}
              </div>
            </div>
            <div className="input-box">
              <label>Year</label>
              <div className="input-wrapper">
                <i className="bx bx-calendar"></i>
                <select
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  className={errors.year ? "error" : ""}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                  <option value="6">6th Year</option>
                </select>
              </div>
              <div className={`error-message ${errors.year ? "show" : ""}`}>
                {errors.year}
              </div>
            </div>
          </div>

          <div className="verify-button">
            <button type="submit">Complete Registration</button>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <button type="button" className="google-register-btn">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="google-icon"
            />
            Register with Google
          </button>

          <div className="back-to-login">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onBack();
              }}
            >
              ← Back to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationForm;
