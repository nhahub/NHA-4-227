import { Card } from '@heroui/react';

const AdminTable = ({ columns = [], data = [], emptyText = 'No data available' }) => {
  return (
    <Card className="border border-[#2A2E3E] bg-[#14161C]">
      <Card.Content className="p-0">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="whitespace-nowrap">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center" style={{ padding: '20px 16px' }}>
                    {emptyText}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr key={row._id || row.id || rowIndex}>
                    {columns.map((column) => (
                      <td key={`${column.key}-${row._id || row.id || rowIndex}`}>
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card.Content>
    </Card>
  );
};

export default AdminTable;
