import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  QueryFn,
} from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import {
  catchError,
  concatMap,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { FireAuthRepository } from './fireauth.repo';
import { USERS_COL } from './firebase.constants';
import { Injectable } from '@angular/core';
import { error } from 'console';

@Injectable({
  providedIn: 'root',
})
export class FirestoreRepository {
  constructor(
    private firestore: AngularFirestore,
    private fireAuth: FireAuthRepository
  ) {}

  // Create a single data object under a user ID
  async createUsersDocument<T>(
    collectionPath: string,
    data: T,
    userId: string = this.fireAuth.sessionUser?.uid || ''
  ): Promise<T> {
    const docRef = this.firestore
      .collection(USERS_COL)
      .doc(userId)
      .collection(collectionPath)
      .doc<T>();
    // The initial creation of our object and the update of the ID
    await docRef.set(this.sanitizeObject(data));
    data = this.update(data, 'id', docRef.ref.id);
    // After the ID is updated, we update the object again
    await this.updateUsersDocument<T>(
      collectionPath,
      docRef.ref.id,
      data,
      userId
    );

    if (!environment.production) {
      console.groupCollapsed(
        `❤️‍🔥 Firestore Service [${collectionPath}] [createUserDocument]`
      );
      console.log(`❤️‍🔥 [${userId}]`, data);
      console.groupEnd();
    }
    return data;
  }

  private update(item: any, key: any, value: any): any {
    item[key] = value;
    return item;
  }

  async createUsersCollection(
    collectionPath: string,
    userId: string = this.fireAuth.sessionUser?.uid || ''
  ): Promise<void> {
    const collectionRef = this.firestore
      .collection(USERS_COL)
      .doc(userId)
      .collection(collectionPath);
    const emptyDocRef = collectionRef.doc(); // Creates a new document reference with an autogenerated ID
    return emptyDocRef.set({}); // Set an empty object to the document
  }

  getUsersDocument<T>(
    collectionPath: string,
    documentKey: string,
    userId: string = this.fireAuth.sessionUser?.uid || ''
  ): Observable<T> {
    if (userId === '') {
      return this.fireAuth.getUserAuthObservable().pipe(
        concatMap((user) => {
          return this.getFocusedUsersDoc<T>(
            collectionPath,
            documentKey,
            user.uid
          );
        })
      );
    } else {
      return this.getFocusedUsersDoc<T>(collectionPath, documentKey, userId);
    }
  }

  private getFocusedUsersDoc<T>(
    collectionPath: string,
    documentKey: string,
    userId: string = this.fireAuth.sessionUser?.uid || ''
  ): Observable<T> {
    const docRef = this.firestore
      .collection(USERS_COL)
      .doc(userId)
      .collection(collectionPath)
      .doc<T>(documentKey);
    return docRef.valueChanges().pipe(
      tap((data) => {
        if (!environment.production) {
          console.groupCollapsed(
            `❤️‍🔥 Firestore Streaming [${collectionPath}] [getUserDocument] [${userId}]`
          );
          console.log(data);
          console.groupEnd();
        }
      }),
      filter((data) => !!data),
      map((data) => data as T)
    );
  }

  getUsersCollection<T>(
    collectionPath: string,
    userId: string = this.fireAuth.sessionUser?.uid || ''
  ): Observable<T[]> {
    if (userId === '') {
      return this.fireAuth.getUserAuthObservable().pipe(
        concatMap((user) => {
          return this.getFocusedCollectionRef<T>(collectionPath, user.uid);
        })
      );
    } else {
      return this.getFocusedCollectionRef<T>(collectionPath, userId);
    }
  }

  private getFocusedCollectionRef<T>(
    collectionPath: string,
    userId: string
  ): Observable<T[]> {
    const collectionRef = this.firestore
      .collection(USERS_COL)
      .doc(userId)
      .collection<T>(collectionPath);
    return collectionRef.valueChanges().pipe(
      tap((data) => {
        if (!environment.production) {
          console.groupCollapsed(
            `❤️‍🔥 Firestore Streaming [${collectionPath}] [getUserCollection] [${userId}]`
          );
          console.log(data);
          console.groupEnd();
        }
      })
    );
  }

  // Patch specific properties and objects as children of the single data object
  async updateUsersDocument<T>(
    collectionPath: string,
    documentKey: string,
    data: Partial<T>,
    userId: string = this.fireAuth.sessionUser?.uid || ''
  ): Promise<boolean> {
    const docRef = this.firestore
      .collection(USERS_COL)
      .doc(userId)
      .collection(collectionPath)
      .doc<T>(documentKey);
    if (!environment.production) {
      console.groupCollapsed(
        `❤️‍🔥 Firestore Service [${collectionPath}] [updateUserDocument]`
      );
      console.log(`❤️‍🔥 [${userId}]`, data);
      console.groupEnd();
    }
    return new Promise<boolean>((resolve, reject) => {
      docRef
        .update(this.sanitizeObject(data))
        .then(() => {
          console.log('❤️‍🔥 Request succeeded');
          resolve(true); // Resolving the Promise with a boolean value indicating success
        })
        .catch((error: any) => {
          console.error('❤️‍🔥 Request failed', error);
          resolve(false); // Resolving the Promise with a boolean value indicating failure
        });
    });
  }

  async updateUsersDocumentMap(
    collectionPath: string,
    documentKey: string,
    data: Map<string, string>,
    userId: string = this.fireAuth.sessionUser?.uid || ''
  ): Promise<void> {
    const docRef = this.firestore
      .collection(USERS_COL)
      .doc(userId)
      .collection(collectionPath)
      .doc(documentKey);
    const objMap = Object.fromEntries(data);
    await docRef.update(this.sanitizeObject({ structuredScript: objMap }));

    if (!environment.production) {
      console.groupCollapsed(
        `❤️‍🔥 Firestore Service [${collectionPath}] [updateUserDocument]`
      );
      console.log(`❤️‍🔥 [${userId}]`, data);
      console.groupEnd();
    }
  }

  deleteUsersDocument<T>(
    collectionPath: string,
    documentKey: string,
    userId: string = this.fireAuth.sessionUser?.uid || ''
  ): Observable<boolean> {
    const document = this.firestore
      .collection(USERS_COL)
      .doc(userId)
      .collection(collectionPath)
      .doc<T>(documentKey);

    if (!environment.production) {
      console.groupCollapsed(
        `❤️‍🔥 Firestore Service [${collectionPath}] [deleteUsersDocument]`
      );
      console.log(`❤️‍🔥 [${userId}]`, documentKey);
      console.groupEnd();
    }

    return new Observable<boolean>((subject) => {
      document
        .delete()
        .then(() => {
          subject.next(true);
        })
        .catch((error) => {
          subject.error(error);
        });
    });
  }

  // Observes a single Firestore document
  observeSpecificDocument<T>(
    collectionName: string,
    documentId: string
  ): Observable<T> {
    const document: AngularFirestoreDocument<T> = this.firestore
      .collection<T>(collectionName)
      .doc<T>(documentId);
    return document.snapshotChanges().pipe(
      map((a) => {
        const data = a.payload.data() as T;
        const id = a.payload.id;
        return { id, ...data };
      })
    );
  }

  // Observe a collection of documents
  observeSpecificCollection<T>(
    collectionPath: string,
    queryFn?: QueryFn
  ): Observable<T[]> {
    return this.firestore
      .collection<T>(collectionPath, queryFn)
      .valueChanges()
      .pipe(
        tap((data) => {
          if (!environment.production) {
            console.groupCollapsed(
              `❤️‍🔥 Firestore Streaming [${collectionPath}] [observeCollection]`
            );
            console.table(data);
            console.groupEnd();
          }
        })
      );
  }

  // Creates a new Firestore document using the full path
  createSpecificDocument<T>(collectionName: string, data: T): Promise<any> {
    const collection: AngularFirestoreCollection<T> =
      this.firestore.collection<T>(collectionName);
    return collection.add(this.sanitizeObject(data));
  }

  // Updates a Firestore document
  updateSpecificDocument<T>(
    collectionName: string,
    documentId: string,
    data: Partial<T>
  ): Promise<void> {
    const document = this.firestore.collection(collectionName).doc(documentId);
    return document.update(this.sanitizeObject(data));
  }

  // Helper function to sanitize the object and remove undefined values
  private sanitizeObject(obj: any): any {
    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value !== 'undefined') {
        sanitizedObj[key] = value;
      }
    }
    return sanitizedObj;
  }
}
