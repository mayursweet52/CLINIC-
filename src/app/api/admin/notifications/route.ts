import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailQueue, smsQueue, whatsappQueue } from "@/lib/queue";
import { Queue } from "bullmq";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const channel = searchParams.get("channel");
  const status = searchParams.get("status");

  const where: any = {};
  if (channel && channel !== "all") {
    where.channel = channel;
  }
  if (status && status !== "all") {
    where.status = status;
  }

  const [total, notifications] = await Promise.all([
    prisma.notificationLog.count({ where }),
    prisma.notificationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    data: notifications,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const log = await prisma.notificationLog.findUnique({ where: { id } });
    if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (log.status !== "FAILED") return NextResponse.json({ error: "Only failed notifications can be retried" }, { status: 400 });

    let queue: Queue;
    if (log.channel === "email") queue = emailQueue;
    else if (log.channel === "sms") queue = smsQueue;
    else if (log.channel === "whatsapp") queue = whatsappQueue;
    else return NextResponse.json({ error: "Unknown channel" }, { status: 400 });

    await prisma.notificationLog.update({
      where: { id },
      data: { status: "PENDING", error: null },
    });

    await queue.add("send", {
      orgId: log.orgId,
      to: log.to,
      templateName: log.template,
      data: log.payload,
    }, { attempts: 3, backoff: { type: "exponential", delay: 1000 } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
