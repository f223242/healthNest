import { colors, Fonts } from "@/constant/theme";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface TableColumn {
  key: string;
  title: string;
  width?: number;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AdminTableProps {
  columns: TableColumn[];
  data: any[];
  onRowPress?: (row: any) => void;
  emptyMessage?: string;
}

const AdminTable: React.FC<AdminTableProps> = ({
  columns,
  data,
  onRowPress,
  emptyMessage = "No data available",
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.headerRow}>
            {columns.map((column) => (
              <View
                key={column.key}
                style={[styles.headerCell, column.width ? { width: column.width } : undefined]}
              >
                <Text style={styles.headerText}>{column.title}</Text>
              </View>
            ))}
          </View>

          {/* Rows */}
          {data.length > 0 ? (
            data.map((row, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.row, index % 2 === 0 && styles.evenRow]}
                onPress={() => onRowPress?.(row)}
                activeOpacity={onRowPress ? 0.7 : 1}
                disabled={!onRowPress}
              >
                {columns.map((column) => (
                  <View
                    key={column.key}
                    style={[styles.cell, column.width ? { width: column.width } : undefined]}
                  >
                    {column.render ? (
                      column.render(row[column.key], row)
                    ) : (
                      <Text style={styles.cellText} numberOfLines={2}>
                        {row[column.key] ?? "-"}
                      </Text>
                    )}
                  </View>
                ))}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminTable;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  table: {
    minWidth: "100%",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: colors.lightGreen,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerCell: {
    flex: 1,
    padding: 12,
    minWidth: 120,
  },
  headerText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: colors.black,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  evenRow: {
    backgroundColor: "#FAFAFA",
  },
  cell: {
    flex: 1,
    padding: 12,
    minWidth: 120,
    justifyContent: "center",
  },
  cellText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: colors.black,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: colors.gray,
  },
});
