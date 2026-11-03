import { ReactNode } from 'react';

const JSON_TOKEN =
  /("[^"]*")\s*:|("[^"]*")|(\b\d+\b)|(\btrue\b|\bfalse\b|\bnull\b)/g;
const YAML_LINE = /^(\s*-?\s*)([\w.]+)(:)(.*)$/;
const QUOTED = /^\s*".*"\s*$/;

/** Tiny highlighter for JSON payloads; colors follow the theme. */
export const JsonCode = ({ data }: { data: unknown }) => {
  const json = JSON.stringify(data, null, 2);
  const parts: ReactNode[] = [];
  let last = 0;

  for (const match of json.matchAll(JSON_TOKEN)) {
    const [token, key, string] = match;
    parts.push(json.slice(last, match.index));
    if (key) {
      parts.push(
        <span key={match.index} className="tok-key">
          {key}
        </span>,
        ':'
      );
    } else {
      parts.push(
        <span key={match.index} className={string ? 'tok-str' : 'tok-num'}>
          {token}
        </span>
      );
    }
    last = match.index + token.length;
  }
  parts.push(json.slice(last));

  return <>{parts}</>;
};

/** Tiny highlighter for YAML automations; colors follow the theme. */
export const YamlCode = ({ text }: { text: string }) => (
  <>
    {text.split('\n').map((line, index) => {
      const match = YAML_LINE.exec(line);
      if (!match) return <div key={index}>{line || ' '}</div>;

      const [, indent, key, colon, value] = match;
      return (
        <div key={index}>
          {indent}
          <span className="tok-key">{key}</span>
          {colon}
          <span className={QUOTED.test(value) ? 'tok-str' : ''}>{value}</span>
        </div>
      );
    })}
  </>
);
