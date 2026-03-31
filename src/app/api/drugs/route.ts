import { NextRequest, NextResponse } from "next/server";
import { fetchDrugCatalogPage, OpenFdaError } from "@/lib/openfda";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const data = await fetchDrugCatalogPage({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      query: searchParams.get("query"),
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof OpenFdaError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "Failed to load the OpenFDA drug catalog." }, { status: 500 });
  }
}