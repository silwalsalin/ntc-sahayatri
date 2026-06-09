const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'नेपालीमा नाम आवश्यक छ / Name in Nepali is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  nameEn: {
    type: String,
    required: [true, 'English name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[9][8-9][0-9]{8}$/, 'Please provide a valid phone number (10 digits starting with 98 or 99)']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'staff', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for complaint count
userSchema.virtual('complaints', {
  ref: 'Complaint',
  localField: 'email',
  foreignField: 'email',
  count: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt on update
userSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public user data
userSchema.methods.getPublicData = function() {
  return {
    id: this._id,
    name: this.name,
    nameEn: this.nameEn,
    email: this.email,
    phone: this.phone,
    role: this.role,
    status: this.status,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('User', userSchema);