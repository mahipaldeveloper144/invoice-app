import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Settings from '@/models/Settings';
import { getUser } from '@/lib/auth';

export async function GET() {
  try {
    const user: any = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    let settings = await Settings.findOne({ userId: user.id });
    
    if (!settings) {
      settings = await Settings.create({ userId: user.id });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user: any = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    await dbConnect();
    
    const settings = await Settings.findOneAndUpdate(
      { userId: user.id },
      body,
      { new: true, upsert: true }
    );

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
