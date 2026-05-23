export default function SpecsTable({ rows }) {
  return (
    <div className="overflow-hidden rounded border border-flipBorder bg-white">
      <table className="w-full text-sm">
        <tbody>
          {rows.map(({ label, value }) => (
            <tr key={label} className="border-b border-flipBorder last:border-0">
              <th
                scope="row"
                className="w-1/3 bg-flipBg px-4 py-2 text-left font-medium text-flipMuted"
              >
                {label}
              </th>
              <td className="px-4 py-2 text-flipText">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
