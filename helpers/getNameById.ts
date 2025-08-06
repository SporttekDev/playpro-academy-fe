export const getNameById = <T extends { id: string; name: string }>(
    id: string,
    dataArray: T[]
) => {
    const item = dataArray.find(item => item.id === id);
    return item ? item.name : id; // atau nilai default lainnya
};