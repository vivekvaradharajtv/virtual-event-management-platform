const { userStore, eventStore, resetStores } = require('../src/store');
const { NotFoundError } = require('../src/errors');

describe('Store', () => {
  beforeEach(() => {
    resetStores();
  });

  describe('userStore', () => {
    it('creates and retrieves user by id', () => {
      const user = userStore.create({
        email: 'a@test.com',
        passwordHash: 'hash',
        name: 'Alice',
        role: 'attendee',
      });
      expect(user.id).toBeDefined();
      expect(user.email).toBe('a@test.com');
      expect(user.role).toBe('attendee');
      expect(userStore.getById(user.id)).toEqual(user);
    });

    it('retrieves user by email (case-insensitive)', () => {
      userStore.create({ email: 'B@test.com', passwordHash: 'h', name: 'B' });
      expect(userStore.getByEmail('b@test.com').email).toBe('b@test.com');
    });

    it('getByIdOrThrow returns user when found', () => {
      const user = userStore.create({
        email: 'c@test.com',
        passwordHash: 'h',
        name: 'C',
      });
      expect(userStore.getByIdOrThrow(user.id)).toEqual(user);
    });

    it('getByIdOrThrow throws NotFoundError when not found', () => {
      expect(() => userStore.getByIdOrThrow('non-existent-id')).toThrow(
        NotFoundError
      );
      expect(() => userStore.getByIdOrThrow('non-existent-id')).toThrow(
        'User with id \'non-existent-id\' not found'
      );
    });

    it('reset clears all users', () => {
      const u = userStore.create({
        email: 'd@test.com',
        passwordHash: 'h',
        name: 'D',
      });
      resetStores();
      expect(userStore.getById(u.id)).toBeNull();
      expect(userStore.getByEmail('d@test.com')).toBeNull();
    });
  });

  describe('eventStore', () => {
    it('creates and lists events', () => {
      const e = eventStore.create({
        title: 'Meetup',
        description: 'A meetup',
        date: '2025-03-01',
        time: '10:00',
        organizerId: 'user-1',
      });
      expect(e.id).toBeDefined();
      expect(e.participantIds).toEqual([]);
      expect(eventStore.getAll()).toHaveLength(1);
      expect(eventStore.getById(e.id)).toEqual(e);
    });

    it('getByIdOrThrow throws NotFoundError when not found', () => {
      expect(() => eventStore.getByIdOrThrow('bad-id')).toThrow(NotFoundError);
      expect(() => eventStore.getByIdOrThrow('bad-id')).toThrow(/Event/);
    });

    it('update modifies allowed fields', () => {
      const e = eventStore.create({
        title: 'Old',
        description: 'Desc',
        date: '2025-01-01',
        time: '09:00',
        organizerId: 'u1',
      });
      const originalUpdatedAt = e.updatedAt;
      eventStore.update(e.id, { title: 'New', time: '10:00' });
      const updated = eventStore.getById(e.id);
      expect(updated.title).toBe('New');
      expect(updated.time).toBe('10:00');
      expect(updated.updatedAt).toBeDefined();
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(originalUpdatedAt).getTime()
      );
    });

    it('remove deletes event', () => {
      const e = eventStore.create({
        title: 'X',
        description: '',
        date: '2025-01-01',
        time: '09:00',
        organizerId: 'u1',
      });
      eventStore.remove(e.id);
      expect(eventStore.getById(e.id)).toBeNull();
    });

    it('addParticipant and removeParticipant update participantIds', () => {
      const e = eventStore.create({
        title: 'E',
        description: '',
        date: '2025-01-01',
        time: '09:00',
        organizerId: 'u1',
      });
      const u2 = 'user-2';
      eventStore.addParticipant(e.id, u2);
      expect(eventStore.getById(e.id).participantIds).toContain(u2);
      eventStore.addParticipant(e.id, u2);
      expect(eventStore.getById(e.id).participantIds).toHaveLength(1);
      eventStore.removeParticipant(e.id, u2);
      expect(eventStore.getById(e.id).participantIds).toEqual([]);
    });
  });
});
