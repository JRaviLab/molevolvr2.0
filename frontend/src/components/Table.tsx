import { useCallback, useMemo, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import {
  LuArrowDown,
  LuArrowDownUp,
  LuArrowUp,
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
  LuDownload,
  LuFilter,
  LuFilterX,
  LuSearch,
} from "react-icons/lu";
import { useLocalStorage } from "@reactuses/core";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  Column,
  FilterFn,
  NoInfer,
  SortingState,
} from "@tanstack/react-table";
import clsx from "clsx";
import { clamp, isEqual, pick, sortBy, sum } from "lodash";
import Collapse from "@/assets/collapse.svg?react";
import Expand from "@/assets/expand.svg?react";
import Button from "@/components/Button";
import Help from "@/components/Help";
import Popover from "@/components/Popover";
import type { Option as OptionMulti } from "@/components/SelectMulti";
import SelectMulti from "@/components/SelectMulti";
import type { Option as OptionSingle } from "@/components/SelectSingle";
import SelectSingle from "@/components/SelectSingle";
import Slider from "@/components/Slider";
import TextBox from "@/components/TextBox";
import Tooltip from "@/components/Tooltip";
import { preserveScroll } from "@/util/dom";
import { downloadCsv } from "@/util/download";
import type { Filename } from "@/util/download";
import { formatDate, formatNumber } from "@/util/string";

type Props<Datum extends object> = {
  cols: _Col<Datum>[];
  rows: Datum[];
  sort?: SortingState;
  filename?: Filename;
  showControls?: boolean;
};

type Col<
  Datum extends object = object,
  Key extends keyof Datum = keyof Datum,
> = {
  /** key of row object to access as cell value */
  key: Key;
  /** label for header */
  name: string;
  /** is sortable (default true) */
  sortable?: boolean;
  /** whether col is individually filterable (default true) */
  filterable?: boolean;
  /**
   * how to treat cell value when filtering individually or searching globally
   * (default string)
   */
  filterType?: "string" | "number" | "enum" | "boolean";
  /** cell attributes */
  attrs?: HTMLAttributes<HTMLTableCellElement>;
  /** cell style */
  style?: CSSProperties;
  /** whether to start column visible (default true) */
  show?: boolean;
  /** tooltip to show in header cell */
  tooltip?: ReactNode;
  /**
   * custom render function for cell. return undefined or null to fallback to
   * default formatting.
   */
  render?: (cell: NoInfer<Datum[Key]>, row: Datum) => ReactNode;
};

/**
 * https://stackoverflow.com/questions/68274805/typescript-reference-type-of-property-by-other-property-of-same-object
 * https://github.com/vuejs/core/discussions/8851
 */
type _Col<Datum extends object> = {
  [Key in keyof Datum]: Col<Datum, Key>;
}[keyof Datum];

/** map column definition to multi-select option */
const colToOption = <Datum extends object>(
  col: Props<Datum>["cols"][number],
  index: number,
): OptionMulti => ({
  id: String(index),
  primary: col.name,
});

/** per page options */
const perPageOptions = [
  { id: 10, primary: formatNumber(10) },
  { id: 25, primary: formatNumber(25) },
  { id: 50, primary: formatNumber(50) },
  { id: 100, primary: formatNumber(100) },
  { id: 10000, primary: "All" },
] as const;

type PerPage = (typeof perPageOptions)[number]["id"];

/**
 * table with sorting, filtering, searching, pagination, etc.
 *
 * reference:
 * https://codesandbox.io/p/devbox/tanstack-table-example-kitchen-sink-vv4871
 */
const Table = <Datum extends object>({
  cols,
  rows,
  sort,
  filename = [],
  showControls = true,
}: Props<Datum>) => {
  "use no memo";

  const filterRef = useRef<HTMLDivElement>(null);

  /** per page state */
  let [perPage, setPerPage] = useState<PerPage>(perPageOptions[0].id);

  /** if not showing controls, show max rows */
  if (!showControls) perPage = perPageOptions[4].id;

  /** expanded state */
  const [expanded, setExpanded] = useLocalStorage("table-expanded", false);

  /** column visibility options for multi-select */
  const visibleOptions = cols.map(colToOption);
  /** visible columns */
  const [visibleCols, setVisibleCols] = useState(
    cols
      .filter((col) => col.show === true || col.show === undefined)
      .map(colToOption)
      .map((option) => option.id),
  );

  /** table-wide search */
  const [search, setSearch] = useState("");

  /** get column definition (from props) by id */
  const getCol = useCallback((id: string) => cols[Number(id)], [cols]);

  /** individual column filter func */
  const filterFunc = useMemo<FilterFn<Datum>>(
    () => (row, columnId, filterValue: unknown) => {
      const type = getCol(columnId)?.filterType ?? "string";
      if (!type) return true;

      /** string column */
      if (type === "string") {
        const value = (filterValue as string).trim();
        if (!value) return true;
        const cell = (row.getValue(columnId) as string).trim();
        if (!cell) return true;
        return !!cell.match(new RegExp(value, "i"));
      }

      /** number col */
      if (type === "number") {
        const value = filterValue as [number, number];
        const cell = row.getValue(columnId) as number;
        return cell >= value[0] && cell <= value[1];
      }

      /** enumerated col */
      if (type === "enum") {
        const cell = row.getValue(columnId) as string;
        const value = filterValue as OptionMulti["id"][];
        if (!value.length) return true;
        return !!value.find((option) => option === cell);
      }

      /** boolean col */
      if (type === "boolean") {
        const cell = row.getValue(columnId);
        const value = filterValue as OptionSingle["id"];
        if (value === "all") return true;
        else return String(cell) === value;
      }

      return true;
    },
    [getCol],
  );

  /** global search func */
  const searchFunc = useMemo<FilterFn<Datum>>(
    () => (row, columnId, filterValue: unknown) => {
      const value = (filterValue as string).trim();
      if (!value) return true;
      const cell = String(row.getValue(columnId)).trim();
      if (!cell) return true;
      return !!cell.match(new RegExp(value, "i"));
    },
    [],
  );

  const columnHelper = createColumnHelper<Datum>();
  /** column definitions */
  const columns = cols.map((col, index) =>
    columnHelper.accessor((row: Datum) => row[col.key], {
      /** unique column id, from position in provided column list */
      id: String(index),
      /** name */
      header: col.name,
      /** sortable */
      enableSorting: col.sortable ?? true,
      /** individually filterable */
      enableColumnFilter: col.filterable ?? true,
      /** only include in table-wide search if column is visible */
      enableGlobalFilter: visibleCols.includes(String(index)),
      /** type of column */
      meta: {
        filterType: col.filterType,
        attrs: col.attrs,
        style: col.style,
        tooltip: col.tooltip,
      },
      /** func to use for filtering individual column */
      filterFn: filterFunc,
      /** render func for cell */
      cell: ({ cell, row }) => {
        const raw = cell.getValue();
        const rendered = col.render?.(raw, row.original);
        return rendered === undefined || rendered === null
          ? defaultFormat(raw)
          : rendered;
      },
    }),
  );

  /** tanstack table api */
  /** https://github.com/facebook/react/issues/33057 */
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: searchFunc,
    getColumnCanGlobalFilter: () => true,
    autoResetPageIndex: true,
    columnResizeMode: "onChange",
    /** initial sort, page, etc. state */
    initialState: {
      sorting: sort,
      pagination: {
        pageIndex: 0,
        pageSize: Number(perPage),
      },
    },
    /** sync some controls with table state */
    state: {
      /** table-wide search */
      globalFilter: search,
      /** which columns are visible */
      columnVisibility: Object.fromEntries(
        cols.map((col, index) => [
          String(index),
          !!visibleCols.includes(String(index)),
        ]),
      ),
    },
  });

  return (
    <div
      className={clsx(
        "flex flex-col items-center gap-4",
        expanded ? "w-[calc(100dvw---spacing(40))]" : "max-w-full",
      )}
    >
      <div className="max-w-full overflow-x-auto rounded-md shadow-sm">
        {/* table */}
        <table
          className="w-full max-w-[min(max-content,var(--content))]"
          aria-rowcount={table.getPrePaginationRowModel().rows.length}
          aria-colcount={cols.length}
        >
          {/* head */}
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    aria-colindex={Number(header.id) + 1}
                    style={getCol(header.column.id)?.style}
                    align="left"
                    {...getCol(header.column.id)?.attrs}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className="
                          flex items-center justify-start
                          [&_button]:p-1 [&_button]:text-gray
                          [&_button]:hover:text-deep
                        "
                      >
                        {/* header label */}
                        <span className="mr-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>

                        {/* header tooltip */}
                        {getCol(header.column.id)?.tooltip && (
                          <Help tooltip={getCol(header.column.id)?.tooltip} />
                        )}

                        {/* header sort */}
                        {header.column.getCanSort() && (
                          <Tooltip content="Sort this column">
                            <button
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {header.column.getIsSorted() ? (
                                header.column.getIsSorted() === "asc" ? (
                                  <LuArrowUp className="text-accent" />
                                ) : (
                                  <LuArrowDown className="text-accent" />
                                )
                              ) : (
                                <LuArrowDownUp />
                              )}
                            </button>
                          </Tooltip>
                        )}

                        {/* header filter */}
                        {header.column.getCanFilter() ? (
                          <Popover
                            content={
                              <Filter
                                column={header.column}
                                def={getCol(header.column.id)}
                              />
                            }
                          >
                            <Tooltip content="Filter this column">
                              <button>
                                {header.column.getIsFiltered() ? (
                                  <LuFilterX className="text-accent" />
                                ) : (
                                  <LuFilter />
                                )}
                              </button>
                            </Tooltip>
                          </Popover>
                        ) : null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* body */}
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  aria-rowindex={
                    table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                    index +
                    1
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={getCol(cell.column.id)?.style}
                      align="left"
                      {...getCol(cell.column.id)?.attrs}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-8 text-center text-light-gray"
                  colSpan={cols.length}
                >
                  No Rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* pagination */}
          <div className="flex gap-2">
            <Button
              design="hollow"
              size="compact"
              tooltip="First page"
              icon={<LuChevronsLeft />}
              aria-disabled={!table.getCanPreviousPage()}
              onClick={() => table.setPageIndex(0)}
            />
            <Button
              design="hollow"
              size="compact"
              tooltip="Previous page"
              icon={<LuChevronLeft />}
              aria-disabled={!table.getCanPreviousPage()}
              onClick={table.previousPage}
            />
            <Tooltip content="Jump to page">
              <Button
                design="hollow"
                size="compact"
                text={[
                  "Page",
                  formatNumber(table.getState().pagination.pageIndex + 1),
                  "of",
                  formatNumber(table.getPageCount()),
                ].join(" ")}
                onClick={() => {
                  const page = parseInt(window.prompt("Jump to page") || "");
                  if (Number.isNaN(page)) return;
                  table.setPageIndex(clamp(page, 1, table.getPageCount()) - 1);
                }}
              />
            </Tooltip>
            <Button
              design="hollow"
              size="compact"
              tooltip="Next page"
              icon={<LuChevronRight />}
              aria-disabled={!table.getCanNextPage()}
              onClick={table.nextPage}
            />
            <Button
              design="hollow"
              size="compact"
              tooltip="Last page"
              icon={<LuChevronsRight />}
              aria-disabled={!table.getCanNextPage()}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            />
          </div>

          {/* filters */}
          <div ref={filterRef} className="flex flex-wrap items-center gap-4">
            {/* per page */}
            <SelectSingle
              label="Rows"
              options={perPageOptions}
              value={perPage}
              onChange={(option) => {
                const number = Number(option) as PerPage;
                setPerPage(number);
                table.setPageSize(number);
                preserveScroll(filterRef.current);
              }}
            />
            {/* visible columns */}
            <SelectMulti
              label="Cols"
              options={visibleOptions}
              value={visibleCols}
              onChange={setVisibleCols}
            />
          </div>

          {/* table-wide search */}
          <TextBox
            placeholder="Search"
            tooltip="Search entire table (regex)"
            icon={<LuSearch />}
            value={search}
            onChange={setSearch}
          />

          {/* actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* clear filters */}
            <Button
              icon={<LuFilterX />}
              design="hollow"
              tooltip="Clear all filters"
              onClick={() => {
                table.resetColumnFilters();
                setSearch("");
              }}
            />
            {/* download */}
            <Button
              design="hollow"
              icon={<LuDownload />}
              tooltip="Download table data as .csv"
              onClick={() => {
                /** get col defs that are visible */
                const defs = visibleCols.map(
                  (visible) => cols[Number(visible)]!,
                );

                /** visible keys */
                const keys = defs.map((def) => def.key);

                /** visible names */
                const names = defs.map((def) => def.name);

                /** filtered row data */
                const data = table
                  .getFilteredRowModel()
                  .rows.map((row) => Object.values(pick(row.original, keys)));

                /** download */
                downloadCsv([names, ...data], [...filename, "table"]);
              }}
            />
            {/* expand/collapse */}
            <Button
              icon={expanded ? <Collapse /> : <Expand />}
              design="hollow"
              tooltip={expanded ? "Collapse table" : "Expand table"}
              onClick={() => setExpanded(!expanded)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;

type FilterProps<Datum extends object> = {
  column: Column<Datum>;
  def?: Col<Datum>;
};

/** content of filter popup for column */
const Filter = <Datum extends object>({ column, def }: FilterProps<Datum>) => {
  /** type of filter */
  const type = def?.filterType ?? "string";

  /** filter as number range */
  if (type === "number") {
    const [min = 0, max = 100] = column.getFacetedMinMaxValues() ?? [];

    return (
      <div className="flex flex-col gap-2">
        <Slider
          label="Filter by number"
          min={min}
          max={max}
          step={(max - min) / 100}
          multi
          value={
            (column.getFilterValue() as [number, number] | undefined) ?? [
              min,
              max,
            ]
          }
          onChange={(value) => {
            /** return as "unfiltered" if value equals min/max range */
            column.setFilterValue(
              isEqual(value, [min, max]) ? undefined : value,
            );
          }}
        />
      </div>
    );
  }

  /** filter as multi-select */
  if (type === "enum") {
    /** get unique values in column */
    const options: OptionMulti[] = sortBy(
      Array.from(column.getFacetedUniqueValues().entries()).map(
        ([name, count]) => ({ name, count }),
      ),
      "count",
    ).map(({ name, count }) => ({
      id: String(name),
      primary: String(name),
      secondary: formatNumber(count),
    }));

    return (
      <div className="flex flex-col gap-2">
        <SelectMulti
          label="Filter by types"
          options={options}
          value={
            (column.getFilterValue() as OptionMulti["id"][] | undefined) ??
            options.map((option) => option.id)
          }
          onChange={(value, count) =>
            /** return as "unfiltered" if all or none are selected */
            column.setFilterValue(
              count === "all" || count === "none" ? undefined : value,
            )
          }
        />
      </div>
    );
  }

  /** filter as boolean */
  if (type === "boolean") {
    /** get options */
    const options: OptionSingle[] = [
      {
        id: "all",
        primary: "All",
        secondary: formatNumber(
          sum(Array.from(column.getFacetedUniqueValues().values())),
        ),
      },
      {
        id: "true",
        primary: "True/Yes",
        secondary: formatNumber(column.getFacetedUniqueValues().get(true) ?? 0),
      },
      {
        id: "false",
        primary: "False/No",
        secondary: formatNumber(
          column.getFacetedUniqueValues().get(false) ?? 0,
        ),
      },
    ];

    return (
      <div className="flex flex-col gap-2">
        <SelectSingle
          label="Filter by type"
          options={options}
          value={
            (column.getFilterValue() as OptionSingle["id"] | undefined) ??
            options[0]!.id
          }
          onChange={(value) =>
            /** return as "unfiltered" if all are selected */
            column.setFilterValue(value === "all" ? undefined : value)
          }
        />
      </div>
    );
  }

  /** filter as text */
  return (
    <div className="flex flex-col gap-2">
      <TextBox
        label="Filter by text (regex)"
        placeholder="Search"
        icon={<LuSearch />}
        value={(column.getFilterValue() as string | undefined) ?? ""}
        onChange={column.setFilterValue}
      />
    </div>
  );
};

/** default cell formatter based on detected type */
const defaultFormat = (cell: unknown) => {
  if (typeof cell === "number") return formatNumber(cell);
  if (typeof cell === "boolean") return cell ? "True" : "False";
  /** if falsey (except 0 and false) */
  if (!cell) return "-";
  if (Array.isArray(cell)) return cell.length.toLocaleString();
  if (cell instanceof Date) return formatDate(cell);
  if (typeof cell === "object")
    return Object.keys(cell).length.toLocaleString();
  if (typeof cell === "string") return cell;
  return String(cell);
};
