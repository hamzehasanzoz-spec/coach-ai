import { useEffect, useState } from "react";
import TopicList from "@/components/admin/TopicList";
import QuestionsPanel from "@/components/admin/QuestionsPanel";

export default function ContentManager({ topics }) {
  const [selected, setSelected] = useState(topics[0]?.name ?? null);

  useEffect(() => {
    if (!selected || !topics.some((topic) => topic.name === selected)) {
      setSelected(topics[0]?.name ?? null);
    }
  }, [topics, selected]);

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <TopicList topics={topics} selected={selected} onSelect={setSelected} />
      <QuestionsPanel topicName={selected} />
    </div>
  );
}