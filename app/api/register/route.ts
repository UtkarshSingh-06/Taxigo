import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Driver from '@/models/Driver';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, role, vehicleType, vehicleNumber, licenseNumber } = body;

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'user',
      isDriver: role === 'driver',
    });

    // If driver, create driver profile
    if (role === 'driver') {
      if (!vehicleType || !vehicleNumber || !licenseNumber) {
        return NextResponse.json(
          { error: 'Please provide all driver details' },
          { status: 400 }
        );
      }

      // Check if vehicle number or license already exists
      const existingDriver = await Driver.findOne({
        $or: [{ vehicleNumber }, { licenseNumber }],
      });

      if (existingDriver) {
        await User.findByIdAndDelete(user._id);
        return NextResponse.json(
          { error: 'Vehicle number or license number already registered' },
          { status: 400 }
        );
      }

      await Driver.create({
        userId: user._id,
        vehicleType,
        vehicleNumber,
        licenseNumber,
        isAvailable: true,
        isOnTrip: false,
      });
    }

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

