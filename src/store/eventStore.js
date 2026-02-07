import { create } from 'zustand';

const useEventStore = create((set, get) => ({
  events: [],
  loading: false,
  error: null,
  selectedEvent: null,

  setEvents: (events) => set({ events }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, event] 
  })),
  
  updateEvent: (id, updatedEvent) => set((state) => ({
    events: state.events.map(event => 
      event.id === id ? { ...event, ...updatedEvent } : event
    )
  })),
  
  deleteEvent: (id) => set((state) => ({
    events: state.events.filter(event => event.id !== id)
  })),
  
  clearError: () => set({ error: null }),
}));

export default useEventStore;
