import { NextResponse } from 'next/server';
import { getStoreStatus } from '@/utils/storeStatus';

export const dynamic = 'force-dynamic'

export async function GET() {
  const status = await getStoreStatus();
  return NextResponse.json(status);
}
