import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User, Updoot } from ".";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @Column({ type: "text" })
  title!: string;

  @Field(() => String)
  @Column({ type: "text" })
  text!: string;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field(() => Int, { nullable: true })
  voteStatus: number | null; // 1 or -1 or null

  @Field(() => String)
  @Column()
  creatorId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user: User) => user.posts)
  creator: User;

  @OneToMany(() => Updoot, (updoot: Updoot) => updoot.post)
  updoots: Updoot[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
