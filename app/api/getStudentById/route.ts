import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";



export async function GET(req:NextRequest){
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
          return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    try{
        NextResponse.json({ message: "Fetching student by ID" });

    }
    catch(err){
        return NextResponse.json("There have been some error please Check")
    }
    
       
    
}