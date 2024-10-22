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

            modelBuilder.Entity("DRYV1.Models.Instrument", b =>
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

                    b.ToTable("Instruments", (string)null);

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

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("DRYV1.Models.Drums", b =>
                {
                    b.HasBaseType("DRYV1.Models.Instrument");

                    b.Property<string>("DrumType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.ToTable("Drums", (string)null);
                });

            modelBuilder.Entity("DRYV1.Models.Guitar", b =>
                {
                    b.HasBaseType("DRYV1.Models.Instrument");

                    b.Property<string>("GuitarType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.ToTable("Guitars", (string)null);
                });

            modelBuilder.Entity("DRYV1.Models.Instrument", b =>
                {
                    b.HasOne("DRYV1.Models.User", null)
                        .WithMany("Instruments")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DRYV1.Models.Drums", b =>
                {
                    b.HasOne("DRYV1.Models.Instrument", null)
                        .WithOne()
                        .HasForeignKey("DRYV1.Models.Drums", "Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DRYV1.Models.Guitar", b =>
                {
                    b.HasOne("DRYV1.Models.Instrument", null)
                        .WithOne()
                        .HasForeignKey("DRYV1.Models.Guitar", "Id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DRYV1.Models.User", b =>
                {
                    b.Navigation("Instruments");
                });
#pragma warning restore 612, 618
        }
    }
}
