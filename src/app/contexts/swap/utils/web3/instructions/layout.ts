import * as BufferLayout from 'buffer-layout';

export const uint64 = (property: string = 'uint64') => {
  return BufferLayout.blob(8, property);
};