import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
}
const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, { payload }: PayloadAction<Notification[]>) {
      state.items = payload;
      state.unreadCount = payload.filter(n => !n.read).length;
    },
    markAllRead(state) {
      state.items = state.items.map(n => ({ ...n, read: true }));
      state.unreadCount = 0;
    },
    markOneRead(state, { payload: id }) {
      const n = state.items.find(n => n._id === id);
      if (n && !n.read) { n.read = true; state.unreadCount--; }
    },
  },
});

export const { setNotifications, markAllRead, markOneRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;

export const selectNotifications = (state: { notifications: NotificationsState }) => state.notifications.items;
export const selectUnreadCount = (state: { notifications: NotificationsState }) => state.notifications.unreadCount;