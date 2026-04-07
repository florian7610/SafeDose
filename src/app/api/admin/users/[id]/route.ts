import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/data/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_me_in_production";

async function getAdminFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") return null;
    return decoded;
  } catch {
    return null;
  }
}

// PATCH /api/admin/users/[id] — update role
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromToken();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const { role, isApproved } = await req.json();

    const updateData: any = {};

    if (role !== undefined) {
      if (!["admin", "patient", "caregiver"].includes(role)) {
        return NextResponse.json({ message: "Invalid role" }, { status: 400 });
      }
      updateData.role = role;
    }

    if (isApproved !== undefined) {
      updateData.isApproved = Boolean(isApproved);
    }

    if (admin.userId === id && role !== undefined) {
      return NextResponse.json({ message: "Cannot change your own role" }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    if (!updated) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({ id: updated._id.toString(), role: updated.role, isApproved: updated.isApproved }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromToken();
  if (!admin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;

    if (admin.userId === id) {
      return NextResponse.json({ message: "Cannot delete your own account" }, { status: 400 });
    }

    await connectToDatabase();
    const { default: Medication } = await import("@/data/models/Medication");
    const { default: Interaction } = await import("@/data/models/Interaction");

    await Medication.deleteMany({ userId: id });
    await Interaction.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}
