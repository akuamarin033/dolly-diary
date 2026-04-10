import { create } from 'zustand';

type DiaryDraftState = {
  date: string;
  title: string;
  body: string;
  weatherId: string;
  moodId: string;
  photos: string[];
  stampCount: number;
  setDate: (date: string) => void;
  setTitle: (title: string) => void;
  setBody: (body: string) => void;
  setWeatherId: (weatherId: string) => void;
  setMoodId: (moodId: string) => void;
  setPhoto: (index: number, uri: string) => void;
  clearPhoto: (index: number) => void;
  addStamp: () => void;
  reset: (date?: string) => void;
};

const emptyPhotos = ['', '', ''];

export const useDiaryDraft = create<DiaryDraftState>((set) => ({
  date: '',
  title: '',
  body: '',
  weatherId: '',
  moodId: '',
  photos: [...emptyPhotos],
  stampCount: 0,
  setDate: (date) => set({ date }),
  setTitle: (title) => set({ title }),
  setBody: (body) => set({ body }),
  setWeatherId: (weatherId) => set({ weatherId }),
  setMoodId: (moodId) => set({ moodId }),
  setPhoto: (index, uri) =>
    set((state) => {
      const next = [...state.photos];
      next[index] = uri;
      return { photos: next };
    }),
  clearPhoto: (index) =>
    set((state) => {
      const next = [...state.photos];
      next[index] = '';
      return { photos: next };
    }),
  addStamp: () => set((state) => ({ stampCount: state.stampCount + 1 })),
  reset: (date = '') => set({ date, title: '', body: '', weatherId: '', moodId: '', photos: [...emptyPhotos], stampCount: 0 }),
}));
