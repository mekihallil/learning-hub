import { db } from "@/app/db/db";
import { Link } from "@heroui/react";
import paths from "@/paths";
import { Chip } from "@heroui/react/chip";
export default async function TopicList() {
  const topics = await db.topic.findMany();

  const renderedTopics = topics.map((topic) => {
    return (
      <div key={topic.slug}>
        <Link href={paths.topicShow(topic.slug)}>
          <Chip color="warning" variant="secondary">
            {topic.slug}
          </Chip>
        </Link>
      </div>
    );
  });

  return renderedTopics;
}
