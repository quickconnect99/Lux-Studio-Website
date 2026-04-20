import { Reveal, type RevealVariant } from "@/components/ui/reveal";

type RevealListProps<T> = {
  items: T[];
  /** Stable key per item (used as React key on the Reveal wrapper). */
  getKey: (item: T) => React.Key;
  /** Render the inner content of each item. */
  render: (item: T, index: number) => React.ReactNode;
  /** Delay increment between items in seconds. Default: 0.05 */
  stagger?: number;
  variant?: RevealVariant;
  direction?: "up" | "left" | "right";
  /** Class applied to every Reveal wrapper. Accepts a static string or a
   *  function `(item, index) => string` for per-item variation. */
  itemClassName?: string | ((item: T, index: number) => string);
};

/**
 * Maps an array of items to staggered `<Reveal>` wrappers.
 *
 * Renders a React fragment — place it inside any grid or flex container.
 * The parent is responsible for the grid layout; RevealList only adds the
 * animation layer on top of each child.
 *
 * @example
 * <div className="grid gap-5">
 *   <RevealList
 *     items={services}
 *     getKey={(s) => s.number}
 *     itemClassName="glass-panel p-6"
 *     render={(service) => <ServiceCard service={service} />}
 *   />
 * </div>
 */
export function RevealList<T>({
  items,
  getKey,
  render,
  stagger = 0.05,
  variant,
  direction,
  itemClassName
}: RevealListProps<T>) {
  return (
    <>
      {items.map((item, index) => (
        <Reveal
          key={getKey(item)}
          delay={index * stagger}
          variant={variant}
          direction={direction}
          className={typeof itemClassName === "function" ? itemClassName(item, index) : itemClassName}
        >
          {render(item, index)}
        </Reveal>
      ))}
    </>
  );
}
