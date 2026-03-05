export function fmt(n: number): string {
  return n.toLocaleString('ko-KR') + '원';
}

export function timeStr(d: Date): string {
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

export function dateStr(d: Date): string {
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
