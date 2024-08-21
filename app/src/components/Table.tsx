import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
  FaDownload,
  FaFilter,
  FaMagnifyingGlass,
  FaMaximize,
  FaMinimize,
  FaSort,
  FaSortDown,
  FaSortUp,
} from "react-icons/fa6";
import { MdFilterAltOff } from "react-icons/md";
import clsx from "clsx";
import { clamp, isEqual, pick, sortBy, sum } from "lodash";
import type { Column, FilterFn, NoInfer } from "@tanstack/react-table";
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
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import Help from "@/components/Help";
import Popover from "@/components/Popover";
import SelectMulti from "@/components/SelectMulti";
import type { Option } from "@/components/SelectSingle";
import SelectSingle from "@/components/SelectSingle";
import Slider from "@/components/Slider";
import TextBox from "@/components/TextBox";
import Tooltip from "@/components/Tooltip";
import { downloadCsv } from "@/util/download";
import { formatNumber } from "@/util/string";
import classes from "./Table.module.css";

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
  /** custom render function for cell */
  render?: (cell: NoInfer<Datum[Key]>) => ReactNode;
};

/**
 * https://stackoverflow.com/questions/68274805/typescript-reference-type-of-property-by-other-property-of-same-object
 * https://github.com/vuejs/core/discussions/8851
 */
type _Col<Datum extends object> = {
  [Key in keyof Datum]: Col<Datum, Key>;
}[keyof Datum];

type Props<Datum extends object> = {
  cols: _Col<Datum>[];
  rows: Datum[];
};

/** map column definition to multi-select option */
const colToOption = <Datum extends object>(
  col: Props<Datum>["cols"][number],
  index: number,
): Option => ({
  id: String(index),
  text: col.name,
});

/**
 * table with sorting, filtering, searching, pagination, etc.
 *
 * reference:
 * https://codesandbox.io/p/devbox/tanstack-table-example-kitchen-sink-vv4871
 */
const Table = <Datum extends object>({ cols, rows }: Props<Datum>) => {
  /** expanded state */
  const [expanded, setExpanded] = useState(true);

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

  /** per page options */
  const perPageOptions = [
    { id: "5", text: 5 },
    { id: "10", text: 10 },
    { id: "50", text: 50 },
    { id: "100", text: 100 },
    { id: "500", text: 500 },
  ].map((option) => ({ ...option, text: formatNumber(option.text) }));

  /** initial per page */
  const defaultPerPage = perPageOptions[1]!.id;

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
        const value = filterValue as Option["id"][];
        if (!value.length) return true;
        return !!value.find((option) => option === cell);
      }

      /** boolean col */
      if (type === "boolean") {
        const cell = row.getValue(columnId);
        const value = filterValue as Option["id"];
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
      cell: (cell) =>
        col.render ? col.render(cell.getValue()) : cell.getValue(),
    }),
  );

  /** tanstack table api */
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
      sorting: [{ id: "0", desc: false }],
      pagination: {
        pageIndex: 0,
        pageSize: Number(defaultPerPage),
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
    <Flex direction="column">
      <div className={clsx(classes.scroll, expanded && "expanded")}>
        {/* table */}
        <table
          className={classes.table}
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
                      <Flex hAlign="left" gap="xs" wrap={false}>
                        {/* header label */}
                        <span className={classes["th-label"]}>
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
                              type="button"
                              className={classes["header-button"]}
                              data-active={
                                header.column.getIsSorted() ? "" : undefined
                              }
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {header.column.getIsSorted() ? (
                                header.column.getIsSorted() === "asc" ? (
                                  <FaSortUp />
                                ) : (
                                  <FaSortDown />
                                )
                              ) : (
                                <FaSort />
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
                              <button
                                type="button"
                                className={classes["header-button"]}
                                data-active={
                                  header.column.getIsFiltered() ? "" : undefined
                                }
                              >
                                <FaFilter />
                              </button>
                            </Tooltip>
                          </Popover>
                        ) : null}
                      </Flex>
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
                <td className={classes.empty} colSpan={cols.length}>
                  No Rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* controls */}
      <Flex gap="lg">
        {/* pagination */}
        <Flex gap="xs">
          <button
            type="button"
            className={classes["page-button"]}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <FaAnglesLeft />
          </button>
          <button
            type="button"
            className={classes["page-button"]}
            onClick={table.previousPage}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <FaAngleLeft />
          </button>
          <Tooltip content="Jump to page">
            <button
              type="button"
              className={classes["page-text"]}
              onClick={() => {
                const page = parseInt(window.prompt("Jump to page") || "");
                if (Number.isNaN(page)) return;
                table.setPageIndex(clamp(page, 1, table.getPageCount()) - 1);
              }}
            >
              Page {formatNumber(table.getState().pagination.pageIndex + 1)} of{" "}
              {formatNumber(table.getPageCount())}
            </button>
          </Tooltip>
          <button
            type="button"
            className={classes["page-button"]}
            onClick={table.nextPage}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <FaAngleRight />
          </button>
          <button
            type="button"
            className={classes["page-button"]}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <FaAnglesRight />
          </button>
        </Flex>

        {/* filters */}
        <Flex gap="sm">
          {/* per page */}
          <SelectSingle
            label="Rows"
            layout="horizontal"
            value={defaultPerPage}
            options={perPageOptions}
            onChange={(option) => {
              table.setPageSize(Number(option));
            }}
          />
          {/* visible columns */}
          <SelectMulti
            label="Cols"
            layout="horizontal"
            options={visibleOptions}
            value={visibleCols}
            onChange={setVisibleCols}
          />
        </Flex>

        {/* table-wide search */}
        <TextBox
          className={classes.search}
          placeholder="Search"
          icon={<FaMagnifyingGlass />}
          value={search}
          onChange={setSearch}
          tooltip="Search entire table for plain text or regex"
        />

        {/* actions */}
        <Flex gap="xs">
          {/* clear filters */}
          <Button
            icon={<MdFilterAltOff />}
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
            icon={<FaDownload />}
            tooltip="Download table data as .csv"
            onClick={() => {
              /** get col defs that are visible */
              const defs = visibleCols.map((visible) => cols[Number(visible)]!);

              /** visible keys */
              const keys = defs.map((def) => def.key);

              /** visible names */
              const names = defs.map((def) => def.name);

              /** filtered row data */
              const data = table
                .getFilteredRowModel()
                .rows.map((row) => Object.values(pick(row.original, keys)));

              /** download */
              downloadCsv([names, ...data], ["geneplexus", "table"]);
            }}
          />
          {/* expand/collapse */}
          <Button
            icon={expanded ? <FaMinimize /> : <FaMaximize />}
            design="hollow"
            tooltip={expanded ? "Collapse table" : "Expand table"}
            onClick={() => setExpanded(!expanded)}
          />
        </Flex>
      </Flex>
    </Flex>
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
      <Slider
        label="Filter"
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
          column.setFilterValue(isEqual(value, [min, max]) ? undefined : value);
        }}
      />
    );
  }

  /** filter as multi-select */
  if (type === "enum") {
    /** get unique values in column */
    const options: Option[] = sortBy(
      Array.from(column.getFacetedUniqueValues().entries()).map(
        ([name, count]) => ({ name, count }),
      ),
      "count",
    ).map(({ name, count }) => ({
      id: String(name),
      text: String(name),
      info: formatNumber(count),
    }));

    return (
      <SelectMulti
        label="Filter"
        options={options}
        value={(column.getFilterValue() as Option["id"][]) ?? options}
        onChange={(value, count) =>
          /** return as "unfiltered" if all or none are selected */
          column.setFilterValue(
            count === "all" || count === "none" ? undefined : value,
          )
        }
      />
    );
  }

  /** filter as boolean */
  if (type === "boolean") {
    /** get options */
    const options: Option[] = [
      {
        id: "all",
        text: "All",
        info: formatNumber(
          sum(Array.from(column.getFacetedUniqueValues().values())),
        ),
      },
      {
        id: "true",
        text: "True/Yes",
        info: formatNumber(column.getFacetedUniqueValues().get(true) ?? 0),
      },
      {
        id: "false",
        text: "False/No",
        info: formatNumber(column.getFacetedUniqueValues().get(false) ?? 0),
      },
    ];

    return (
      <SelectSingle
        label="Filter"
        options={options}
        value={(column.getFilterValue() as Option["id"]) ?? options[0]!.id}
        onChange={(value) =>
          /** return as "unfiltered" if all are selected */
          column.setFilterValue(value === "all" ? undefined : value)
        }
      />
    );
  }

  /** filter as text */
  return (
    <TextBox
      placeholder="Search"
      value={(column.getFilterValue() as string | undefined) ?? ""}
      onChange={column.setFilterValue}
      icon={<FaMagnifyingGlass />}
    />
  );
};
