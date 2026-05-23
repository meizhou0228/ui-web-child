interface Props {
  progress: number;
}

function messageFor(progress: number): string {
  if (progress >= 1) return '今天的小学生准备力满格，记得给自己一个大大的拥抱。';
  if (progress >= 0.5) return '已经走到半路啦，再完成一个任务就更接近小学城堡。';
  if (progress > 0) return '开始得很好，慢慢来，每个小任务都算数。';
  return '今天从一个小任务开始，选最容易的那一个就好。';
}

export function TodayEncouragement({ progress }: Props) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-white rounded-big p-3 shadow-soft">
      <div className="text-sm font-bold text-gray-700">今日鼓励</div>
      <p className="text-sm text-gray-600 mt-1">{messageFor(progress)}</p>
    </div>
  );
}
