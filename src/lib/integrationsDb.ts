import { firestore } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export interface UserIntegrationRecord {
  userId: string;
  provider: string;
  isConnected: boolean;
  mcpEndpoint?: string;
  accountInfo?: {
    username?: string;
    email?: string;
    workspaceName?: string;
    avatarUrl?: string;
  };
  connectedAt: string;
  updatedAt: string;
}

/**
 * Saves or updates a user integration connection state in Firestore
 */
export async function setUserIntegrationConnected(
  userId: string,
  provider: string,
  accountInfo?: {
    username?: string;
    email?: string;
    workspaceName?: string;
    avatarUrl?: string;
  }
): Promise<void> {
  const docId = `${userId}_${provider}`;
  const docRef = doc(firestore, 'user_integrations', docId);

  const record: UserIntegrationRecord = {
    userId,
    provider,
    isConnected: true,
    accountInfo: accountInfo || {
      workspaceName: 'مساحة العمل المتصلة',
      username: 'TOLZY Developer'
    },
    connectedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(docRef, record, { merge: true });
}

/**
 * Retrieves the user integration record from Firestore
 */
export async function getUserIntegration(
  userId: string,
  provider: string
): Promise<UserIntegrationRecord | null> {
  if (!userId) return null;
  const docId = `${userId}_${provider}`;
  const docRef = doc(firestore, 'user_integrations', docId);

  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data() as UserIntegrationRecord;
    return data;
  } catch (err) {
    console.error('Error fetching user integration:', err);
    return null;
  }
}

/**
 * Disconnects / removes the user integration
 */
export async function deleteUserIntegration(
  userId: string,
  provider: string
): Promise<void> {
  const docId = `${userId}_${provider}`;
  const docRef = doc(firestore, 'user_integrations', docId);
  await deleteDoc(docRef);
}

/**
 * Checks if user integration is active
 */
export async function isUserIntegrationActive(
  userId: string,
  provider: string
): Promise<boolean> {
  const record = await getUserIntegration(userId, provider);
  return !!record && record.isConnected;
}
