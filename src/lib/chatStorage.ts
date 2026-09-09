import { firestore } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { ChatSession } from './types';

/**
 * Save or update a chat session in Firestore under users/{userId}/chats/{chatId}
 */
export async function saveChatToFirestore(userId: string, chat: ChatSession): Promise<void> {
  if (!userId || !chat || !chat.id) return;

  try {
    const chatDocRef = doc(firestore, 'users', userId, 'chats', chat.id);
    await setDoc(chatDocRef, {
      id: chat.id,
      title: chat.title || 'محادثة جديدة',
      createdAt: chat.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: chat.messages || []
    }, { merge: true });
  } catch (error) {
    console.warn('Failed to sync chat to Firestore:', error);
  }
}

/**
 * Load all chat sessions for a user from Firestore
 */
export async function loadUserChatsFromFirestore(userId: string): Promise<ChatSession[]> {
  if (!userId) return [];

  try {
    const chatsColRef = collection(firestore, 'users', userId, 'chats');
    const q = query(chatsColRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const chats: ChatSession[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      chats.push({
        id: data.id || docSnap.id,
        title: data.title || 'محادثة جديدة',
        createdAt: data.createdAt || new Date().toISOString(),
        messages: Array.isArray(data.messages) ? data.messages : []
      });
    });

    return chats;
  } catch (error) {
    console.warn('Failed to load chats from Firestore:', error);
    return [];
  }
}

/**
 * Delete a single chat from Firestore
 */
export async function deleteChatFromFirestore(userId: string, chatId: string): Promise<void> {
  if (!userId || !chatId) return;

  try {
    const chatDocRef = doc(firestore, 'users', userId, 'chats', chatId);
    await deleteDoc(chatDocRef);
  } catch (error) {
    console.warn('Failed to delete chat from Firestore:', error);
  }
}

/**
 * Delete all chats for a user from Firestore
 */
export async function clearAllUserChatsFromFirestore(userId: string): Promise<void> {
  if (!userId) return;

  try {
    const chatsColRef = collection(firestore, 'users', userId, 'chats');
    const snapshot = await getDocs(chatsColRef);
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.warn('Failed to clear all chats from Firestore:', error);
  }
}
