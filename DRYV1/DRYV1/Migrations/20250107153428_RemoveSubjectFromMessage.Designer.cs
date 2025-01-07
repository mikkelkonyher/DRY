﻿// <auto-generated />
using System;
using System.Collections.Generic;
using DRYV1.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DRYV1.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20250107153428_RemoveSubjectFromMessage")]
    partial class RemoveSubjectFromMessage
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.10")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("DRYV1.Models.Comment", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int?>("ForumId")
                        .HasColumnType("integer");

                    b.Property<int?>("MusicGearId")
                        .HasColumnType("integer");

                    b.Property<int?>("RehearsalRoomId")
                        .HasColumnType("integer");

                    b.Property<string>("Text")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("ForumId");

                    b.HasIndex("MusicGearId");

                    b.HasIndex("RehearsalRoomId");

                    b.HasIndex("UserId");

                    b.ToTable("Comments");
                });

            modelBuilder.Entity("DRYV1.Models.Favorite", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("MusicGearId")
                        .HasColumnType("integer");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("MusicGearId");

                    b.ToTable("Favorites");
                });

            modelBuilder.Entity("DRYV1.Models.ForumLikes", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("ForumId")
                        .HasColumnType("integer");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("ForumId");

                    b.ToTable("ForumLikes");
                });

            modelBuilder.Entity("DRYV1.Models.Message", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Content")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("ReceiverId")
                        .HasColumnType("integer");

                    b.Property<int>("SenderId")
                        .HasColumnType("integer");

                    b.Property<DateTime>("Timestamp")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.ToTable("Messages");
                });

            modelBuilder.Entity("DRYV1.Models.MusicGear", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Brand")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Condition")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("FavoriteCount")
                        .HasColumnType("integer");

                    b.Property<List<string>>("ImagePaths")
                        .IsRequired()
                        .HasColumnType("text[]");

                    b.Property<DateTime>("ListingDate")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Location")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Model")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<decimal>("Price")
                        .HasColumnType("numeric");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.Property<int>("Year")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("MusicGear", (string)null);

                    b.UseTptMappingStrategy();
                });

            modelBuilder.Entity("DRYV1.Models.MusicUtilities.Forum", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Body")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("LikeCount")
                        .HasColumnType("integer");

                    b.Property<string>("Subject")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("character varying(100)");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.ToTable("Forums");
                });

            modelBuilder.Entity("DRYV1.Models.MusicUtilities.RehearsalRoom", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Address")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("FavoriteCount")
                        .HasColumnType("integer");

                    b.Property<List<string>>("ImagePaths")
                        .IsRequired()
                        .HasColumnType("text[]");

                    b.Property<DateTime>("ListingDate")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Location")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PaymentType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<decimal>("Price")
                        .HasColumnType("numeric");

                    b.Property<int>("RoomSize")
                        .HasColumnType("integer");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("RehearsalRooms");
                });

            modelBuilder.Entity("DRYV1.Models.RehearsalRoomFavorites", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int>("RehearsalRoomid")
                        .HasColumnType("integer");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("RehearsalRoomid");

                    b.ToTable("RehearsalRoomFavorites");
                });

            modelBuilder.Entity("DRYV1.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsValidated")
                        .HasColumnType("boolean");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ProfileImageUrl")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("DRYV1.Models.DrumsGear", b =>
                {
                    b.HasBaseType("DRYV1.Models.MusicGear");

                    b.Property<string>("DrumsGearType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.ToTable("DrumsGear", (string)null);
                });

            modelBuilder.Entity("DRYV1.Models.GuitBassGear", b =>
                {
                    b.HasBaseType("DRYV1.Models.MusicGear");

                    b.Property<string>("GuitBassType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.ToTable("GuitBassGear", (string)null);
                });

            modelBuilder.Entity("DRYV1.Models.HornsGear", b =>
                {
                    b.HasBaseType("DRYV1.Models.MusicGear");

                    b.Property<string>("HornsGearType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.ToTable("HornsGear", (string)null);
                });

            modelBuilder.Entity("DRYV1.Models.KeysGear", b =>
                {
                    b.HasBaseType("DRYV1.Models.MusicGear");

                    b.Property<string>("KeysGearType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.ToTable("KeysGear", (string)null);
                });

            modelBuilder.Entity("DRYV1.Models.StringsGear", b =>
                {
                    b.HasBaseType("DRYV1.Models.MusicGear");

                    b.Property<string>("StringsGearType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.ToTable("StringsGear", (string)null);
                });

            modelBuilder.Entity("DRYV1.Models.StudioGear", b =>
                {
                    b.HasBaseType("DRYV1.Models.MusicGear");

                    b.Property<string>("StudioGearType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.ToTable("StudioGear", (string)null);
                });

            modelBuilder.Entity("DRYV1.Models.Comment", b =>
                {
                    b.HasOne("DRYV1.Models.MusicUtilities.Forum", "Forum")
                        .WithMany("Comments")
                        .HasForeignKey("ForumId");

                    b.HasOne("DRYV1.Models.MusicGear", "MusicGear")
                        .WithMany("Comments")
                        .HasForeignKey("MusicGearId");

                    b.HasOne("DRYV1.Models.MusicUtilities.RehearsalRoom", "RehearsalRoom")
                        .WithMany("Comments")
                        .HasForeignKey("RehearsalRoomId");

                    b.HasOne("DRYV1.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Forum");

                    b.Navigation("MusicGear");

                    b.Navigation("RehearsalRoom");

                    b.Navigation("User");
                });

            modelBuilder.Entity("DRYV1.Models.Favorite", b =>
                {
                    b.HasOne("DRYV1.Models.MusicGear", "MusicGear")
                        .WithMany()
                        .HasForeignKey("MusicGearId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("MusicGear");
                });

            modelBuilder.Entity("DRYV1.Models.ForumLikes", b =>
                {
                    b.HasOne("DRYV1.Models.MusicUtilities.Forum", "Forum")
                        .WithMany()
                        .HasForeignKey("ForumId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Forum");
                });

            modelBuilder.Entity("DRYV1.Models.MusicGear", b =>
                {
                    b.HasOne("DRYV1.Models.User", null)
                        .WithMany("MusicGear")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DRYV1.Models.MusicUtilities.RehearsalRoom", b =>
                {
                    b.HasOne("DRYV1.Models.User", null)
                        .WithMany("RehearsalRooms")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DRYV1.Models.RehearsalRoomFavorites", b =>
                {
                    b.HasOne("DRYV1.Models.MusicUtilities.RehearsalRoom", "RehearsalRoom")
                        .WithMany()
                        .HasForeignKey("RehearsalRoomid")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("RehearsalRoom");
                });

            modelBuilder.Entity("DRYV1.Models.DrumsGear", b =>
                {
                    b.HasOne("DRYV1.Models.MusicGear", null)
                        .WithOne()
                        .HasForeignKey("DRYV1.Models.DrumsGear", "Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DRYV1.Models.GuitBassGear", b =>
                {
                    b.HasOne("DRYV1.Models.MusicGear", null)
                        .WithOne()
                        .HasForeignKey("DRYV1.Models.GuitBassGear", "Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DRYV1.Models.HornsGear", b =>
                {
                    b.HasOne("DRYV1.Models.MusicGear", null)
                        .WithOne()
                        .HasForeignKey("DRYV1.Models.HornsGear", "Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DRYV1.Models.KeysGear", b =>
                {
                    b.HasOne("DRYV1.Models.MusicGear", null)
                        .WithOne()
                        .HasForeignKey("DRYV1.Models.KeysGear", "Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DRYV1.Models.StringsGear", b =>
                {
                    b.HasOne("DRYV1.Models.MusicGear", null)
                        .WithOne()
                        .HasForeignKey("DRYV1.Models.StringsGear", "Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DRYV1.Models.StudioGear", b =>
                {
                    b.HasOne("DRYV1.Models.MusicGear", null)
                        .WithOne()
                        .HasForeignKey("DRYV1.Models.StudioGear", "Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DRYV1.Models.MusicGear", b =>
                {
                    b.Navigation("Comments");
                });

            modelBuilder.Entity("DRYV1.Models.MusicUtilities.Forum", b =>
                {
                    b.Navigation("Comments");
                });

            modelBuilder.Entity("DRYV1.Models.MusicUtilities.RehearsalRoom", b =>
                {
                    b.Navigation("Comments");
                });

            modelBuilder.Entity("DRYV1.Models.User", b =>
                {
                    b.Navigation("MusicGear");

                    b.Navigation("RehearsalRooms");
                });
#pragma warning restore 612, 618
        }
    }
}
