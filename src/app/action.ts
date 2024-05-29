"use server";

import { redis } from "@/lib/redis";
import { error } from "console";
import { redirect } from "next/navigation";

export const createTopic = async ({ topicName }: { topicName: string }) => {
  const regex = /^[a-zA-Z-]+$/;

  if (!topicName || topicName.length > 50) {
    return { error: "Name must be between 1 and 50 chars" };
  }

  if (!regex.test(topicName)) {
    return { error: "Only letters and hypens are allowed in name" };
  }

  await redis.sadd("existing-topics", topicName);

  redirect(`/${topicName}`);
};
