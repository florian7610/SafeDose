import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Medication from "@/data/models/Medication";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_me_in_production";

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await connectToDatabase();
    
    const deletedMed = await Medication.findOneAndDelete({ _id: id, userId });
    if (!deletedMed) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Medication deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const updates = await req.json();
    
    await connectToDatabase();
    
    const updatedMed = await Medication.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    );

    if (!updatedMed) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const { _id, ...rest } = updatedMed.toObject();
    return NextResponse.json({
      id: _id.toString(),
      ...rest
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update" }, { status: 500 });
  }
}
