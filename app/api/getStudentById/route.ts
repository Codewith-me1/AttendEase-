import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStudentEmailById } from "@/app/firebase/adminDb";



export async function GET(req:NextRequest){
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
          return NextResponse.json({ error: "Class ID required" }, { status: 400 });
    }

    try{
        const data = await getStudentEmailById(userId); 

        return NextResponse.json(data)
    }
    catch(err){
        return NextResponse.json("There have been some error please Check")
    }
    
       
    
}