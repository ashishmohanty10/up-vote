"use server";

import { redis } from "@/lib/redis";
import { error } from "console";
import { redirect } from "next/navigation";

//Create Topic Logic

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

//word frequency checker function

function wordFreq(text: string): { text: string; value: number }[] {
  const words: string[] = text.replace(/\./g, "").split(/\s/);
  const freqMap: Record<string, number> = {};

  for (const w of words) {
    if (!freqMap[w]) freqMap[w] = 0;
    freqMap[w] += 1;
  }
  return Object.keys(freqMap).map((word) => ({
    text: word,
    value: freqMap[word],
  }));
}

//Comment submit logic
export const submitComment = async ({
  comment,
  topicName,
}: {
  comment: string;
  topicName: string;
}) => {
  const words = wordFreq(comment);

  await Promise.all(
    words.map(async (word) => {
      await redis.zadd(
        `room:${topicName}`,
        { incr: true },
        { member: word.text, score: word.value }
      );
    })
  );

  await redis.incr("served-requests");

  await redis.publish(`room:${topicName}`, words);
};
