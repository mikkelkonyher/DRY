﻿// <auto-generated />
using System;
using System.Collections.Generic;
using DRYV1.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DRYV1.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    partial class ApplicationDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
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

                    b.Property<int>("MusicGearId")
                        .HasColumnType("integer");

                    b.Property<string>("Text")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("MusicGearId");

                    b.HasIndex("UserId");

                    b.ToTable("Comments");
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

            modelBuilder.Entity("DRYV1.Models.Comment", b =>
                {
                    b.HasOne("DRYV1.Models.MusicGear", null)
                        .WithMany("Comments")
                        .HasForeignKey("MusicGearId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("DRYV1.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("DRYV1.Models.MusicGear", b =>
                {
                    b.HasOne("DRYV1.Models.User", null)
                        .WithMany("MusicGear")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
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

            modelBuilder.Entity("DRYV1.Models.MusicGear", b =>
                {
                    b.Navigation("Comments");
                });

            modelBuilder.Entity("DRYV1.Models.User", b =>
                {
                    b.Navigation("MusicGear");
                });
#pragma warning restore 612, 618
        }
    }
}
