import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
    unique: true,
  })
  userName: string;

  @Column({
    length: 150,
  })
  fullName: string;

  @Column({
    length: 255,
  })
  hashedPassword: string;

  @Column({
    type: "bigint",
  })
  registerDate: number;

  @Column({
    type: "bigint",
    nullable: true,
  })
  lastLoginDate: number | null;

  @Column({
    default: true,
  })
  isActive: boolean;
}
