const GROUP_EVENT = /^onepassword_group_(.*)_updated$/;

type EventNameProps = {
  name: string;
  className?: string;
};

/** onepassword_group_<b>xiaomi</b>_updated: the varying part carries the weight. */
export const EventName = ({ name, className = '' }: EventNameProps) => {
  const group = GROUP_EVENT.exec(name)?.[1];

  if (group) {
    return (
      <span className={`evt ${className}`}>
        onepassword_group_
        {group === '{name}' ? <i>{group}</i> : <b>{group}</b>}
        _updated
      </span>
    );
  }

  return (
    <span className={`evt ${className}`}>
      onepassword_<b>{name.replace(/^onepassword_/, '')}</b>
    </span>
  );
};
