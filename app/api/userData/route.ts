import { NextRequest, NextResponse } from "next/server";



export async function GET(req:NextRequest){

    const {searchParams} = new URL(req.url);
    const id = searchParams.get('id');
    
    try{
        

        return NextResponse.json({message:"This is the Data"+id})
        
    }
    catch(error){
        return NextResponse.json({message:"This is A Error"})
    }
}