import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
  FaDownload,
  FaFilter,
  FaMagnifyingGlass,
  FaSort,
  FaSortDown,
  FaSortUp,
} from "react-icons/fa6";
import { clamp, isEqual, pick } from "lodash";
import type {
  Column,
  FilterFnOption,
  NoInfer,
  RowData,
} from "@tanstack/react-table";
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
  type Table,
} from "@tanstack/react-table";
import Button from "@/components/Button";
import Popover from "@/components/Popover";
import Select from "@/components/Select";
import type { Option } from "@/components/Select";
import Slider from "@/components/Slider";
import TextBox from "@/components/TextBox";
import { downloadCsv } from "@/util/download";
import classes from "./Table.module.css";

type Props<Datum extends object> = {
  cols: readonly {
    /** key of row object to access as value */
    key: keyof Datum;
    /** label for header */
    name: string;
    /** is sortable (default true) */
    sortable?: boolean;
    /** is filterable, and how to filter (default string) */
    filterable?: "string" | "number" | "enum";
    /** visibility (default true) */
    show?: boolean;
    /** custom render function for cell */
    render?: (cell: NoInfer<Datum[keyof Datum]>) => ReactNode;
  }[];
  rows: Datum[];
};

/** https://tanstack.com/table/v8/docs/api/core/column-def#meta */
declare module "@tanstack/table-core" {
  // eslint-disable-next-line
  interface ColumnMeta<TData extends RowData, TValue> {
    filterable: NonNullable<Props<object>["cols"][number]["filterable"]>;
  }
}

/** map column definition to multi-select option */
const colToOption = <Datum extends object>(
  col: Props<Datum>["cols"][number],
  index: number,
) => ({
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
  /** column visibility options for multi-select */
  const visibleOptions = cols.map(colToOption);
  /** visible columns */
  const [visible, setVisible] = useState<Option[]>(
    cols
      .filter((col) => col.show === true || col.show === undefined)
      .map(colToOption),
  );

  /** table-wide search */
  const [search, setSearch] = useState("");

  /** per page options */
  const perPageOptions = [
    { id: "5", text: "5" },
    { id: "10", text: "10" },
    { id: "50", text: "50" },
    { id: "100", text: "100" },
    { id: "500", text: "500" },
  ];

  /** custom filter func */
  const filterFunc = useMemo<FilterFnOption<Datum>>(
    () => (row, columnId, filterValue: unknown) => {
      const type = cols[Number(columnId)]?.filterable ?? "string";

      /** string column */
      if (type === "string") {
        const value = filterValue as string;
        const cell = row.getValue(columnId) as string;
        if (!cell.trim()) return true;
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

        /** if filtering with multi-select */
        if (Array.isArray(filterValue)) {
          const value = filterValue as Option[];
          if (!value.length) return true;
          return !!value.find((option) => option.text === cell);
        }

        /** if filtering with plain text */
        if (typeof filterValue === "string") {
          return !!cell.match(new RegExp(filterValue, "i"));
        }
      }

      return true;
    },
    [cols],
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
      enableSorting: col.sortable || true,
      /** individually filterable */
      enableColumnFilter: !!col.filterable || false,
      /** include in table-wide search if column is visible */
      enableGlobalFilter: !!visible.find(
        (visible) => visible.id === String(index),
      ),
      /** type of column */
      meta: { filterable: col.filterable ?? "string" },
      /** func to use for filtering */
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
    globalFilterFn: filterFunc,
    autoResetPageIndex: true,
    columnResizeMode: "onChange",
    /** initial sort, page, etc. state */
    initialState: {
      sorting: [{ id: "0", desc: false }],
      pagination: {
        pageIndex: 0,
        pageSize: Number(perPageOptions[0]!.id),
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
          !!visible.find((visible) => visible.id === String(index)),
        ]),
      ),
    },
  });

  return (
    <>
      {/* top controls */}
      <div className="flex-row gap-md">
        {/* visible columns */}
        <Select
          label="Cols"
          layout="horizontal"
          multi={true}
          options={visibleOptions}
          value={visible}
          onChange={setVisible}
        />

        {/* table-wide search */}
        <TextBox
          placeholder="Search"
          width={150}
          icon={<FaMagnifyingGlass />}
          value={search}
          onChange={setSearch}
        />

        {/* download */}
        <Button
          icon={<FaDownload />}
          text="CSV"
          onClick={() => {
            /** get col defs that are visible */
            const defs = visible.map((visible) => cols[Number(visible.id)]!);

            /** visible keys */
            const keys = defs.map((def) => def.key);

            /** visible names */
            const names = defs.map((def) => def.name);

            /** filtered row data */
            const data = table
              .getFilteredRowModel()
              .rows.map((row) => Object.values(pick(row.original, keys)));

            /** download */
            downloadCsv([names, ...data], ["molevolvr", "table"]);
          }}
          design="accent"
        />
      </div>

      {/* if data */}
      {rows.length &&
      visible.length &&
      table.getFilteredRowModel().rows.length ? (
        <div className={classes.scroll}>
          {/* table */}
          <table className={classes.table}>
            {/* head */}
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div className={classes.th}>
                          {/* header label */}
                          <span className={classes["th-label"]}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </span>

                          {/* header sort */}
                          <button
                            className={classes["header-button"]}
                            data-active={
                              header.column.getIsSorted() ? "" : undefined
                            }
                            onClick={header.column.getToggleSortingHandler()}
                            aria-label={`Sort "${header.column.columnDef.header}"`}
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

                          {/* header filter */}
                          {header.column.getCanFilter() ? (
                            <Popover
                              label={`Filter "${header.column.columnDef.header}"`}
                              content={<Filter column={header.column} />}
                            >
                              <button
                                className={classes["header-button"]}
                                data-active={
                                  header.column.getIsFiltered() ? "" : undefined
                                }
                              >
                                <FaFilter />
                              </button>
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
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /** fallback */
        <div className="placeholder">No rows</div>
      )}

      {/* bottom controls */}
      <div className="flex-row gap-md">
        {/* pagination */}
        <div className={classes.pagination}>
          <button
            className={classes["page-button"]}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <FaAnglesLeft />
          </button>
          <button
            className={classes["page-button"]}
            onClick={table.previousPage}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <FaAngleLeft />
          </button>
          <span className={classes["page-text"]}>
            Page{" "}
            <button
              onClick={() => {
                const page = parseInt(window.prompt("Jump to page") || "");
                if (Number.isNaN(page)) return;
                table.setPageIndex(clamp(page, 1, table.getPageCount()) - 1);
              }}
              // aria-label="Jump to page"
            >
              {table.getState().pagination.pageIndex + 1}
            </button>{" "}
            of {table.getPageCount()}
          </span>
          <button
            className={classes["page-button"]}
            onClick={table.nextPage}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <FaAngleRight />
          </button>
          <button
            className={classes["page-button"]}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <FaAnglesRight />
          </button>
        </div>

        {/* per page */}
        <Select
          label="Per page"
          layout="horizontal"
          options={perPageOptions}
          onChange={(option) => table.setPageSize(Number(option.id))}
          width={70}
        />
      </div>
    </>
  );
};

export default Table;

type FilterProps<Datum extends object> = {
  column: Column<Datum>;
};

/** content of filter popup for column */
const Filter = <Datum extends object>({ column }: FilterProps<Datum>) => {
  /** get unique values in column */
  const unique = column.getFacetedUniqueValues();
  const uniqueValues = useMemo(
    () => Array.from(unique.keys()).sort(),
    [unique],
  );

  /** type of filter */
  const type = column.columnDef.meta?.filterable;

  /** filter as number range */
  if (type === "number") {
    const [min = 0, max = 100] = column.getFacetedMinMaxValues() || [];
    return (
      <Slider
        min={min}
        max={max}
        multi={true}
        value={(column.getFilterValue() as [number, number]) ?? [min, max]}
        onChange={(value) => {
          /** return as "unfiltered" if value equals min/max range */
          column.setFilterValue(isEqual(value, [min, max]) ? undefined : value);
        }}
      />
    );
  }

  /** filter as multi-select */
  if (type === "enum") {
    return (
      <Select
        options={uniqueValues.map((value) => ({
          id: String(value),
          text: String(value),
        }))}
        value={column.getFilterValue() as Option[]}
        onChange={(value, count) =>
          /** return as "unfiltered" if none are selected */
          column.setFilterValue(count === "none" ? undefined : value)
        }
        multi={true}
      />
    );
  }

  /** filter as text */
  return (
    <TextBox
      placeholder="Search"
      value={(column.getFilterValue() as string) || ""}
      onChange={column.setFilterValue}
      icon={<FaMagnifyingGlass />}
    />
  );
};
