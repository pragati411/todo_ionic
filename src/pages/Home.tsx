import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import "./Home.css";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import useSQLiteDB from "../composables/useSQLiteDB";
import useConfirmationAlert from "../composables/useConfirmationAlert";

type SQLItem = {
  id: number;
  name: string;
};

const Home: React.FC = () => {
  const [editItem, setEditItem] = useState<any>();
  const [inputName, setInputName] = useState("");
  const [items, setItems] = useState<Array<SQLItem>>();

  
  const { performSQLAction, initialized } = useSQLiteDB();

  
  const { showConfirmationAlert, ConfirmationAlert } = useConfirmationAlert();

  useEffect(() => {
    loadData();
  }, [initialized]);

  
  const loadData = async () => {
    try {
      // query db
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        const respSelect = await db?.query(`SELECT * FROM test`);
        setItems(respSelect?.values);
      });
    } catch (error) {
      alert((error as Error).message);
      setItems([]);
    }
  };

  const updateItem = async () => {
    try {
     
      performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          await db?.query(`UPDATE test SET name=? WHERE id=?`, [
            inputName,
            editItem?.id,
          ]);

        
          const respSelect = await db?.query(`SELECT * FROM test;`);
          setItems(respSelect?.values);
        },
        async () => {
          setInputName("");
          setEditItem(undefined);
        }
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const addItem = async () => {
    try {
      
      performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          await db?.query(`INSERT INTO test (id,name) values (?,?);`, [
            Date.now(),
            inputName,
          ]);

          
          const respSelect = await db?.query(`SELECT * FROM test;`);
          setItems(respSelect?.values);
        },
        async () => {
          setInputName("");
        }
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const confirmDelete = (itemId: number) => {
    showConfirmationAlert("Are You Sure You Want To Delete This Item?", () => {
      deleteItem(itemId);
    });
  };

  const deleteItem = async (itemId: number) => {
    try {
     
      performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          await db?.query(`DELETE FROM test WHERE id=?;`, [itemId]);

         
          const respSelect = await db?.query(`SELECT * FROM test;`);
          setItems(respSelect?.values);
        },
        async () => {
          setInputName("");
        }
      );
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const doEditItem = (item: SQLItem | undefined) => {
    if (item) {
      setEditItem(item);
      setInputName(item.name);
    } else {
      setEditItem(undefined);
      setInputName("");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add Todo</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {editItem ? (
          <IonItem>
            <IonInput
              type="text"
              value={inputName}
              onIonInput={(e) => setInputName(e.target.value as string)}
            ></IonInput>
            <IonButton onClick={() => doEditItem(undefined)}>CANCEL</IonButton>
            <IonButton onClick={updateItem}>UPDATE</IonButton>
          </IonItem>
        ) : (
          <IonItem>
            <IonInput
              type="text"
              value={inputName}
              onIonInput={(e) => setInputName(e.target.value as string)}
            ></IonInput>
            <IonButton slot="end" onClick={addItem} disabled={inputName.trim() === ""}>
              ADD
            </IonButton>
          </IonItem>
        )}

        <h3>Todo task</h3>

        {items?.map((item) => (
          <IonItem key={item?.id}>
            <IonLabel className="ion-text-wrap">{item.name}</IonLabel>
            <IonButton onClick={() => doEditItem(item)}>EDIT</IonButton>
            <IonButton onClick={() => confirmDelete(item.id)}>DELETE</IonButton>
          </IonItem>
        ))}

        {ConfirmationAlert}
      </IonContent>
    </IonPage>
  );
};

export default Home;
