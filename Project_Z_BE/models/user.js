const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["prime-admin", "admin", "user"],
    default: "user",
  },
  phone: {
    type: Number,
    required: false,
    unique: true,
  },
  address: {
    addressLine1: {
      type: String,
      required: true, // This field is required
    },
    addressLine2: {
      type: String,
      required: false, // This field is optional
    },
    state: {
      type: String,
      required: true, // This field is required
    },
    district: {
      type: String,
      required: true, // This field is required
    },
    pincode: {
      type: String,
      required: true, // This field is required
      validate: {
        validator: function (v) {
          return /^\d{6}$/.test(v); // Validate that pincode is a 6-digit number
        },
        message: (props) => `${props.value} is not a valid pincode!`,
      },
    },
  },
  gender: {
    type: String,
    enum: ["male", "female"], // Accept only 'male' or 'female'
  },
  dob: {
    type: Date,
    required: true, // This field is required
  },
  age: {
    type: Number,
    required: true, // This field is required
  },
  parentsInfo: {
    father: {
      name: {
        type: String,
        required: true, // This field is required
      },
      contactNumber: {
        type: String,
        required: true, // This field is required
        validate: {
          validator: function (v) {
            return /^\d{10}$/.test(v); // Validate that contact number is a 10-digit number
          },
          message: (props) => `${props.value} is not a valid contact number!`,
        },
      },
    },
    mother: {
      name: {
        type: String,
        required: true, // This field is required
      },
      contactNumber: {
        type: String,
        required: true, // This field is required
        validate: {
          validator: function (v) {
            return /^\d{10}$/.test(v); // Validate that contact number is a 10-digit number
          },
          message: (props) => `${props.value} is not a valid contact number!`,
        },
      },
    },
  },
  about: {
    type: String,
    maxlength: 2000, // Limit to 2000 characters
    required: true, // This field is required
  },
});

// Export the User model
module.exports = mongoose.model("User", userSchema);
